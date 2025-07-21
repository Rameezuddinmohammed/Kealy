# Kealy: The Stripe for API Keys

Kealy is a developer-first platform for securely storing, detecting, and using API keys across any application. It provides a zero-knowledge encrypted vault, seamless key detection via a Chrome extension, and a modern, responsive UI.

## Features
- **Zero-Knowledge Vault:** Securely store all your API keys, encrypted client-side.
- **Google Auth:** Sign in with Google for a fast, secure experience.
- **Add, List, Delete Keys:** Manage your API keys with a clean, modern UI.
- **Dark Mode:** Toggle between light and dark themes.
- **Service Filtering:** Organize and filter your keys by service.
- **Chrome Extension:** Detects API keys on any web page and offers to save them to your Kealy vault with one click.

## Getting Started

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd Kealy/kealy-frontend
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in `kealy-frontend/` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://tuhmgihugkuykzsujdiv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1aG1naWh1Z2t1eWt6c3VqZGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODMyNDUsImV4cCI6MjA2ODY1OTI0NX0.3nl9RmRU6BPEYG4OUi4SphUDCQ56N2hxND4CkkzaK_Y
```

### 4. Run the App
```sh
npm run dev
```
The app will be available at [http://localhost:5173](http://localhost:5173).

## Chrome Extension: Kealy Key Detector

The extension detects API keys on any web page and lets you save them to your Kealy vault.

### Setup
1. Go to `kealy-extension/` in your project root.
2. In Chrome, open `chrome://extensions` and enable Developer Mode.
3. Click "Load unpacked" and select the `kealy-extension/` folder.
4. Visit any page with an API key, click the Kealy extension icon, and use "Save to Kealy" to add the key to your vault.

> **Note:** The extension opens the Kealy web app with the detected key pre-filled. Make sure the app is running locally for the best experience.

## Project Structure
- `kealy-frontend/` — Main React + Vite frontend
- `kealy-extension/` — Chrome extension for key detection

## Contributing
- Use TypeScript and follow the existing code style.
- Environment variables are managed via `.env` and `import.meta.env`.
- For Supabase integration, see `src/supabaseClient.ts`.
- PRs and issues welcome!

## License
MIT
