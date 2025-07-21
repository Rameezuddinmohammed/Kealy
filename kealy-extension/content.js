// Kealy content script: Detect likely API keys on the page
(function() {
  // Simple regex for demo: 32+ chars, alphanumeric or base64-like
  const keyRegex = /([A-Za-z0-9_\-]{32,})/g
  const found = new Set()
  const textNodes = []

  // Collect all visible text nodes
  function walk(node) {
    if (node.nodeType === 3) {
      textNodes.push(node)
    } else if (node.nodeType === 1 && node.childNodes && !['SCRIPT','STYLE','NOSCRIPT','IFRAME'].includes(node.tagName)) {
      for (let child of node.childNodes) walk(child)
    }
  }
  walk(document.body)

  for (const node of textNodes) {
    const matches = node.textContent.match(keyRegex)
    if (matches) {
      matches.forEach(k => found.add(k))
    }
  }

  if (found.size > 0) {
    window.postMessage({ source: 'kealy-content', keys: Array.from(found) }, '*')
  }
})(); 