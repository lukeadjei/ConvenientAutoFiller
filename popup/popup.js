// popup.js
// Runs when the user opens the popup by clicking the extension icon.
// This file handles the entire UI: loading saved credentials, saving new ones, and clearing them.
//
// How it connects to the rest of the extension:
//   - Reads SITE_CONFIGS from config/sites.js (loaded before this file in popup.html)
//   - Reads and writes credentials to chrome.storage.local
//   - Does NOT communicate with content.js directly — they share state only through storage

// Wait for the HTML to be fully parsed before running our code.
// This is the standard pattern for JS that needs to interact with DOM elements.
document.addEventListener("DOMContentLoaded", async () => {

  // ---- Get references to all the DOM elements we'll need ----
  const siteSelect     = document.getElementById("site-select");
  const usernameInput  = document.getElementById("username-input");
  const passwordInput  = document.getElementById("password-input");
  const toggleBtn      = document.getElementById("toggle-password");
  const iconEyeOpen    = document.getElementById("icon-eye-open");
  const iconEyeClosed  = document.getElementById("icon-eye-closed");
  const form           = document.getElementById("credential-form");
  const toast          = document.getElementById("toast");

  // ---- Build the site dropdown from SITE_CONFIGS ----
  // SITE_CONFIGS is a global variable defined in config/sites.js,
  // which is loaded before this file in popup.html.
  // We loop over every site and create an <option> element for each one.
  SITE_CONFIGS.forEach(site => {
    const option = document.createElement("option");
    option.value = site.id;        // The value is the site's id (e.g. "umd_cas")
    option.textContent = site.name; // The visible text (e.g. "UMD CAS Login")
    siteSelect.appendChild(option);
  });

  // ---- Load credentials for the currently selected site ----
  // This is called once when the popup opens, and again whenever the dropdown changes.
  async function loadCredentials() {
    const siteId = siteSelect.value;
    const storageKey = `credentials_${siteId}`; // e.g. "credentials_umd_cas"

    // chrome.storage.local.get() returns an object.
    // We ask for a specific key and destructure the result.
    const result = await chrome.storage.local.get(storageKey);
    const creds = result[storageKey]; // undefined if nothing is saved for this site

    // The ?. is optional chaining — if creds is undefined, this returns undefined instead of throwing.
    // The ?? "" means "use empty string if the value is null or undefined".
    usernameInput.value = creds?.username ?? "";
    passwordInput.value = creds?.password ?? "";
  }

  // Run loadCredentials when the dropdown selection changes
  siteSelect.addEventListener("change", loadCredentials);

  // Also run it immediately when the popup first opens
  await loadCredentials();

  // ---- Toggle password visibility ----
  toggleBtn.addEventListener("click", () => {
    const isCurrentlyHidden = passwordInput.type === "password";

    if (isCurrentlyHidden) {
      // Show the password: switch to text type, swap icons
      passwordInput.type = "text";
      iconEyeOpen.style.display = "none";
      iconEyeClosed.style.display = "block";
    } else {
      // Hide the password: switch back to password type, swap icons
      passwordInput.type = "password";
      iconEyeOpen.style.display = "block";
      iconEyeClosed.style.display = "none";
    }
  });

  // ---- Save credentials ----
  // The form's "submit" event fires when the user clicks Save or presses Enter.
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Stop the form from refreshing the page (default browser behavior)

    const username = usernameInput.value.trim(); // .trim() removes accidental leading/trailing spaces
    const password = passwordInput.value;        // Don't trim passwords — spaces may be intentional

    if (!username || !password) {
      showToast("Please fill in both fields.", "error");
      return;
    }

    const siteId = siteSelect.value;
    const storageKey = `credentials_${siteId}`;

    // chrome.storage.local.set() takes an object where the key is the storage key
    // and the value is whatever you want to store. It's async, so we await it.
    await chrome.storage.local.set({
      [storageKey]: { username, password }
      // [storageKey] is computed property syntax — the variable's value becomes the key name.
      // This is equivalent to: { "credentials_umd_cas": { username, password } }
    });

    showToast("Credentials saved!", "success");
  });

  // ---- Clear saved credentials ----
  document.getElementById("clear-btn").addEventListener("click", async () => {
    const siteId = siteSelect.value;
    const storageKey = `credentials_${siteId}`;

    await chrome.storage.local.remove(storageKey);

    usernameInput.value = "";
    passwordInput.value = "";

    // Reset password field to hidden mode if it was visible
    passwordInput.type = "password";
    iconEyeOpen.style.display = "block";
    iconEyeClosed.style.display = "none";

    showToast("Cleared.", "info");
  });

  // ---- Toast helper ----
  // Shows a brief notification at the bottom of the popup, then hides it after 2 seconds.
  let toastTimer; // We store the timer so we can cancel it if showToast is called again quickly

  function showToast(message, type = "info") {
    clearTimeout(toastTimer); // Cancel any existing toast timer

    toast.textContent = message;
    toast.className = `toast toast-${type} visible`; // CSS transitions handle the animation

    toastTimer = setTimeout(() => {
      toast.classList.remove("visible"); // Slide back down after 2 seconds
    }, 2000);
  }

});
