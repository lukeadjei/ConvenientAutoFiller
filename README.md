# ConvenientAutoFiller

A customizable Chrome extension meant for auto-filling login fields and potentially other fields that cannot be detected or done by Chrome already.

---

## What it does

Chrome's built-in autofill often fails on university SSO pages, custom login portals, and other non-standard forms. ConvenientAutoFiller lets you save credentials for any site you configure and automatically fills them in every time you visit — no interaction needed.

Currently configured for:
- **UMD CAS Login** — University of Maryland Central Authentication Service (Shibboleth SSO)

Adding support for a new site takes less than a minute and requires editing one file.

---

## Features

- Credentials saved locally in your browser — nothing leaves your machine
- Dropdown UI to manage multiple sites from one popup
- Show/hide password toggle
- Scalable: add new sites by editing a single config file
- Built with Manifest V3 (Chrome's current extension standard)

---

## Installation

This extension is not on the Chrome Web Store — it's loaded directly from your local files.

1. Clone or download this repository
   ```
   git clone https://github.com/lukeadjei/ConvenientAutoFiller.git
   ```

2. Open Chrome and navigate to `chrome://extensions`

3. Enable **Developer mode** using the toggle in the top-right corner

4. Click **Load unpacked** and select the `ConvenientAutoFiller` folder

5. Click the puzzle piece icon in the Chrome toolbar and pin **ConvenientAutoFiller**

---

## Usage

1. Click the extension icon in your toolbar to open the popup
2. Select a site from the dropdown
3. Enter your username and password, then click **Save**
4. Navigate to the login page — your credentials will be filled in automatically

To update or remove credentials, open the popup and use **Save** to overwrite or **Clear** to delete.

---

## Project Structure

```
ConvenientAutoFiller/
├── manifest.json         # Extension config — permissions, URL patterns, file registration
├── background.js         # Service worker (event broker, minimal role)
├── content.js            # Injected into login pages to detect and fill form fields
├── config/
│   └── sites.js          # All site configurations live here — edit to add new sites
├── popup/
│   ├── popup.html        # Popup UI structure
│   ├── popup.css         # Popup styles
│   └── popup.js          # Popup logic — save, load, and clear credentials
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Adding a New Site

Only two files need to change.

**1. `config/sites.js` — add a new entry to the array:**

```js
{
  id: "my_new_site",                        // unique key, no spaces
  name: "My New Site",                      // shown in the popup dropdown
  urlPattern: "login.example.com",          // matched against window.location.hostname
  usernameSelector: "#username",            // CSS selector for the username field
  passwordSelector: "#password",            // CSS selector for the password field
  submitSelector: "button[type='submit']",  // CSS selector for the submit button
  autoSubmit: false                         // set true to auto-click submit after filling
}
```

**2. `manifest.json` — add the URL in two places:**

```json
"host_permissions": [
  "https://shib.idm.umd.edu/*",
  "https://login.example.com/*"
],
"content_scripts": [
  {
    "matches": [
      "https://shib.idm.umd.edu/*",
      "https://login.example.com/*"
    ],
    ...
  }
]
```

Then reload the extension at `chrome://extensions` and save credentials via the popup.

---

## How to Find CSS Selectors for a New Site

1. Visit the login page you want to configure
2. Press **F12** to open Chrome DevTools
3. Click the inspector cursor (top-left of DevTools) and click on the username field
4. Look at the highlighted HTML for `id`, `name`, or `type` attributes
5. Test your selector in the DevTools console:
   ```js
   document.querySelector("#username")
   // Returns the element if found, null if not
   ```

---

## Privacy & Security

- Credentials are stored in `chrome.storage.local` — private to this extension, never synced to Google
- No network requests are made by this extension
- `autoSubmit` is disabled by default so you can verify fills before submitting
- Not recommended for use on shared or work machines

---

## Tech Stack

| Layer | Technology |
|---|---|
| Extension platform | Chrome Extensions Manifest V3 |
| Language | Vanilla JavaScript, HTML, CSS |
| Storage | `chrome.storage.local` |

---

## License

Personal use. Not intended for distribution.
