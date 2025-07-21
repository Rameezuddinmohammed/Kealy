// Kealy content script: Detect likely API keys on the page

function findApiKeys() {
  const regexes = [
    // More specific patterns first
    /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]+/g, // JWT (Supabase keys)
    /sk_live_[0-9a-zA-Z]{24,}/g, // Stripe live
    /sk_test_[0-9a-zA-Z]{24,}/g, // Stripe test
    /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g, // SendGrid
    /ghp_[A-Za-z0-9]{36}/g, // GitHub Personal Access Token
    /AIza[0-9A-Za-z\-_]{35}/g, // Google API Key
    /ya29\.[0-9A-Za-z\-_]+/g, // Google OAuth
    /AKIA[0-9A-Z]{16}/g, // AWS Access Key ID
    // Keep a generic one, but make it less likely to overlap
    /(?<!\.)[A-Za-z0-9_\-]{40,}(?!\.)/g // Generic fallback: 40+ chars, not part of a JWT
  ];
  
  const found = new Set();

  function walk(node) {
    if (node.nodeType === 3) { // TEXT_NODE
        for (const regex of regexes) {
            const matches = node.textContent.match(regex);
            if (matches) {
                matches.forEach(k => found.add(k));
            }
        }
    } else if (node.nodeType === 1 && node.childNodes && !['SCRIPT','STYLE','NOSCRIPT','IFRAME'].includes(node.tagName)) {
        for (let child of node.childNodes) {
            walk(child);
        }
    }
  }
  walk(document.body);

  const inputs = document.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    if (input.value && typeof input.value === 'string') {
        for (const regex of regexes) {
            const matches = input.value.match(regex);
            if (matches) {
                matches.forEach(k => found.add(k));
            }
        }
    }
  });
  
  // Post-processing to remove substrings
  let finalKeys = Array.from(found);
  finalKeys = finalKeys.filter(key => {
    // Keep a key if no other key in the list includes it as a substring
    return !finalKeys.some(otherKey => otherKey !== key && otherKey.includes(key));
  });

  return finalKeys;
}

// Listen for a message from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getKeys") {
    const keys = findApiKeys();
    sendResponse({ keys: keys });
  }
  return true; 
});