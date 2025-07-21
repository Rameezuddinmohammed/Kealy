// Kealy content script: Final version with targeted name detection

function findApiKeys() {
  const regexes = [
    /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]+/g, // JWT (Supabase keys)
    /sk_live_[0-9a-zA-Z]{24,}/g, // Stripe live
    /sk_test_[0-9a-zA-Z]{24,}/g, // Stripe test
    /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g, // SendGrid
    /ghp_[A-Za-z0-9]{36}/g, // GitHub Personal Access Token
    /AIza[0-9A-Za-z\-_]{35}/g, // Google API Key
    /ya29\.[0-9A-Za-z\-_]+/g, // Google OAuth
    /AKIA[0-9A-Z]{16}/g, // AWS Access Key ID
    /(?<!\.)[A-Za-z0-9_\-]{40,}(?!\.)/g // Generic fallback
  ];

  const foundKeys = new Map(); // Use a Map to store { key => name }

  // NEW: A much smarter function to find the name for a key element
  function findNameForKeyElement(element) {
    let parent = element.closest('.grid'); // Find the common container (works for Supabase)
    if (parent) {
      const label = parent.querySelector('label');
      if (label) {
        const codeTags = label.querySelectorAll('code');
        if (codeTags.length > 0) {
          return Array.from(codeTags).map(tag => tag.textContent.trim()).join(' ');
        }
        // Fallback to the label's full text if no code tags are found
        const labelText = label.textContent.trim().replace(/[:\n].*/, '').trim();
        if (labelText) return labelText;
      }
    }

    // Fallback for simpler layouts: check previous sibling
    let sibling = element.previousElementSibling;
    if (sibling && sibling.textContent.trim().length < 50) {
      return sibling.textContent.trim().replace(/[:\n].*/, '').trim();
    }
    
    // Fallback to the input's own name or id attribute
    return element.name || element.id || 'Untitled Key';
  }

  // 1. Walk through all text nodes (less common for keys, but still useful)
  function walk(node) {
    if (node.nodeType === 3) { // TEXT_NODE
      for (const regex of regexes) {
        const matches = [...node.textContent.matchAll(regex)];
        if (matches.length > 0) {
          const name = findNameForKeyElement(node.parentElement);
          matches.forEach(match => {
            if (!foundKeys.has(match[0])) {
              foundKeys.set(match[0], name);
            }
          });
        }
      }
    } else if (node.nodeType === 1 && node.childNodes && !['SCRIPT','STYLE','NOSCRIPT','IFRAME'].includes(node.tagName)) {
      for (let child of node.childNodes) walk(child);
    }
  }
  walk(document.body);

  // 2. Explicitly check all input fields (most common case)
  const inputs = document.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    if (input.value && typeof input.value === 'string') {
      for (const regex of regexes) {
        const matches = [...input.value.matchAll(regex)];
        if (matches.length > 0) {
          const name = findNameForKeyElement(input);
          matches.forEach(match => {
            if (!foundKeys.has(match[0])) {
              foundKeys.set(match[0], name);
            }
          });
        }
      }
    }
  });

  // Post-processing to remove substrings
  let finalKeysMap = new Map();
  let keys = Array.from(foundKeys.keys());
  keys.forEach(key => {
    if (!keys.some(otherKey => otherKey !== key && otherKey.includes(key))) {
      finalKeysMap.set(key, foundKeys.get(key));
    }
  });
  
  return Array.from(finalKeysMap, ([key, name]) => ({ key, name }));
}

// --- The message listener remains the same ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getKeys") {
    const keys = findApiKeys();
    sendResponse({ keys: keys });
  }
  return true; 
});