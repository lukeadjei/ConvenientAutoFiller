// content.js
// This script is automatically injected by Chrome into any page whose URL matches
// the "content_scripts" > "matches" patterns in manifest.json.
//
// Important: this script runs INSIDE the web page, but in an isolated JS environment.
// That means:
//   - It CAN read and modify the page's DOM (inputs, buttons, etc.)
//   - It CANNOT access the page's own JavaScript variables or functions
//   - It CAN use chrome extension APIs like chrome.storage
//
// SITE_CONFIGS is available here because Chrome injects config/sites.js first
// (the "js" array in manifest.json lists config/sites.js before content.js).

// We wrap everything in an immediately-invoked async function so we can use
// "await" at the top level. The parentheses at the end call it right away.
(async function () {

  // ---- Step 1: Find which site config matches this page ----
  const hostname = window.location.hostname; // e.g. "shib.idm.umd.edu"

  // .find() returns the first config object whose urlPattern is contained in the hostname,
  // or undefined if none match.
  const siteConfig = SITE_CONFIGS.find(config => hostname.includes(config.urlPattern));

  // No config matches this page — do nothing and exit silently.
  if (!siteConfig) return;

  // ---- Step 2: Check if we have saved credentials for this site ----
  const storageKey = `credentials_${siteConfig.id}`; // e.g. "credentials_umd_cas"

  // Ask chrome.storage.local for the credentials we saved from the popup.
  const result = await chrome.storage.local.get(storageKey);
  const credentials = result[storageKey]; // undefined if the user hasn't saved anything yet

  // No credentials saved — do nothing and exit silently.
  // The user will see the blank form and can fill it manually.
  if (!credentials) return;

  // ---- Step 3: Find the form fields on the page ----
  // document.querySelector() finds the first element matching a CSS selector.
  // These selectors come from the site config in config/sites.js.
  const usernameField = document.querySelector(siteConfig.usernameSelector);
  const passwordField = document.querySelector(siteConfig.passwordSelector);

  // If the fields aren't found (wrong selectors, or page structure changed), bail out.
  if (!usernameField || !passwordField) {
    console.warn("AutoFiller: Could not find form fields on this page. Check selectors in config/sites.js.");
    return;
  }

  // ---- Step 4: Fill in the values ----
  usernameField.value = credentials.username;
  passwordField.value = credentials.password;

  // ---- Step 5: Fire input/change events on the fields ----
  // This step is important. Many modern login pages (including ones built with
  // React, Angular, or Vue) don't watch the raw .value property — they listen
  // for DOM events to know when an input changed. If we just set .value without
  // firing events, the page might think the fields are empty when you click submit.
  //
  // We fire both "input" (fires while typing) and "change" (fires when focus leaves)
  // to cover whichever one the page is listening for.
  const inputEvent  = new Event("input",  { bubbles: true });
  const changeEvent = new Event("change", { bubbles: true });

  usernameField.dispatchEvent(inputEvent);
  usernameField.dispatchEvent(changeEvent);
  passwordField.dispatchEvent(inputEvent);
  passwordField.dispatchEvent(changeEvent);

  // ---- Step 6: Auto-submit (only if enabled in site config) ----
  // autoSubmit is false by default. Enable it only after you've verified
  // that the fill works correctly, so you don't accidentally submit blank fields.
  if (siteConfig.autoSubmit) {
    const submitBtn = document.querySelector(siteConfig.submitSelector);
    if (submitBtn) {
      submitBtn.click();
    } else {
      console.warn("AutoFiller: autoSubmit is true but submit button not found. Check submitSelector.");
    }
  }

})();
