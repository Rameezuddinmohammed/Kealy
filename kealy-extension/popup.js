// Kealy extension popup.js
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('keys-container');

  function renderKeys(keys) {
    if (!keys || keys.length === 0) {
      container.innerHTML = '<p>No API keys detected on this page.</p>';
      return;
    }
    container.innerHTML = '';
    keys.forEach(key => {
      const div = document.createElement('div');
      div.className = 'key-item';
      div.innerHTML = `<code>${key}</code> <button>Save to Kealy</button>`;
      div.querySelector('button').onclick = () => {
        window.open(`http://localhost:5173/?key=${encodeURIComponent(key)}`, '_blank');
      };
      container.appendChild(div);
    });
  }

  // When the popup opens, send a message to the content script of the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getKeys" }, (response) => {
      if (chrome.runtime.lastError) {
        // This can happen on pages where the content script can't be injected
        container.innerHTML = `<p>Cannot access this page. Try another page like the Supabase dashboard.</p>`;
        console.error(chrome.runtime.lastError.message);
      } else if (response && response.keys) {
        renderKeys(response.keys);
      } else {
        renderKeys([]);
      }
    });
  });
}); 