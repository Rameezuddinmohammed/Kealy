// Kealy extension popup.js
const container = document.getElementById('keys-container')

function renderKeys(keys) {
  if (!keys || keys.length === 0) {
    container.innerHTML = '<p>No API keys detected on this page.</p>'
    return
  }
  container.innerHTML = ''
  keys.forEach(key => {
    const div = document.createElement('div')
    div.className = 'key-item'
    div.innerHTML = `<code>${key}</code> <button>Save to Kealy</button>`
    div.querySelector('button').onclick = () => {
      // Open Kealy add-key form with key pre-filled (adjust URL as needed)
      window.open(`http://localhost:5173/?key=${encodeURIComponent(key)}`, '_blank')
    }
    container.appendChild(div)
  })
}

// Listen for messages from content script
window.addEventListener('message', (event) => {
  if (event.data && event.data.source === 'kealy-content') {
    renderKeys(event.data.keys)
  }
})

// Request keys from content script (in case popup opened after detection)
window.postMessage({ source: 'kealy-popup-request' }, '*') 