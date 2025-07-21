// Kealy extension popup.js

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('keys-container');

  // Helper to detect service provider from URL
  function detectServiceProvider(url) {
    if (url.includes('supabase.com')) return 'Supabase';
    if (url.includes('openai.com')) return 'OpenAI';
    // Add more providers as needed
    return '';
  }

  function renderKeys(keys, service) {
    if (!keys || keys.length === 0) {
      container.innerHTML = '<p class="empty">No API keys detected on this page.</p>';
      return;
    }
    container.innerHTML = '';
    keys.forEach(({ key, name }) => {
      const div = document.createElement('div');
      div.className = 'key-item';
      div.innerHTML = `
        <div class="key-label">${name ? `<span>${name}</span>` : ''}</div>
        <code class="key-value">${key}</code>
        <button class="save-btn">Save</button>
      `;
      div.querySelector('.save-btn').onclick = () => {
        // Open Kealy add-key form with key, name, and service pre-filled
        let url = `http://localhost:5173/?key=${encodeURIComponent(key)}`;
        if (name) url += `&name=${encodeURIComponent(name)}`;
        if (service) url += `&service=${encodeURIComponent(service)}`;
        window.open(url, '_blank');
      };
      container.appendChild(div);
    });
  }

  // When the popup opens, send a message to the content script of the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const service = detectServiceProvider(tab.url || '');
    chrome.tabs.sendMessage(tab.id, { action: "getKeys" }, (response) => {
      if (chrome.runtime.lastError) {
        container.innerHTML = `<p class="empty">Cannot access this page. Try another page like the Supabase dashboard.</p>`;
        console.error(chrome.runtime.lastError.message);
      } else if (response && response.keys) {
        renderKeys(response.keys, service);
      } else {
        renderKeys([], service);
      }
    });
  });
}); 