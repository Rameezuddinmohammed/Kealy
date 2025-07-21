// Kealy content script: Detect likely API keys on the page

// This function finds keys on the page.
function findApiKeys() {
  const regexes = [
    /sk_live_[0-9a-zA-Z]{24,}/g, // Stripe live
    /sk_test_[0-9a-zA-Z]{24,}/g, // Stripe test
    /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g, // SendGrid
    /ghp_[A-Za-z0-9]{36}/g, // GitHub Personal Access Token
    /AIza[0-9A-Za-z\-_]{35}/g, // Google API Key
    /ya29\.[0-9A-Za-z\-_]+/g, // Google OAuth
    /AKIA[0-9A-Z]{16}/g, // AWS Access Key ID
    /[A-Za-z0-9_\-]{32,}/g // Generic: 32+ chars, fallback
  ];
  const found = new Set();
  const textNodes = [];

  function walk(node) {
    if (node.nodeType === 3) {
      textNodes.push(node);
    } else if (node.nodeType === 1 && node.childNodes && !['SCRIPT','STYLE','NOSCRIPT','IFRAME'].includes(node.tagName)) {
      for (let child of node.childNodes) walk(child);
    }
  }
  walk(document.body);

  for (const node of textNodes) {
    for (const regex of regexes) {
      const matches = node.textContent.match(regex);
      if (matches) {
        matches.forEach(k => found.add(k));
      }
    }
  }
  return Array.from(found);
}

// Listen for a message from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getKeys") {
    const keys = findApiKeys();
    sendResponse({ keys: keys });
  }
}); 