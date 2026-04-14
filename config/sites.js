// config/sites.js
// ============================================================
// THIS IS THE ONLY FILE YOU NEED TO EDIT TO ADD A NEW SITE.
// ============================================================
//
// Each object in this array represents one site AutoFiller knows about.
// content.js and popup.js both load this file and read from SITE_CONFIGS.
//
// To add a new site:
//   1. Add a new object below following the same shape
//   2. In manifest.json, add the site URL to:
//      - "host_permissions"
//      - "content_scripts" > "matches"
//   That's it. No other files need to change.
//
// Field reference:
//   id              — unique key (no spaces). Used as the storage key.
//   name            — display name shown in the popup dropdown.
//   urlPattern      — string matched against window.location.hostname.
//   usernameSelector — CSS selector for the username/ID input field.
//   passwordSelector — CSS selector for the password input field.
//   submitSelector  — CSS selector for the submit/login button.
//   autoSubmit      — if true, clicks the submit button automatically after filling.
//                     Keep this false until you've verified the fill works correctly.

const SITE_CONFIGS = [
  {
    id: "umd_cas",
    name: "UMD CAS Login",
    urlPattern: "shib.idm.umd.edu",
    usernameSelector: "#username",
    passwordSelector: "#password",
    submitSelector: "input[type='submit'], button[type='submit']",
    autoSubmit: false
  }

  // Example of a second site (remove the comment slashes to enable):
  // {
  //   id: "example_site",
  //   name: "Example Login",
  //   urlPattern: "login.example.com",
  //   usernameSelector: "#user-email",
  //   passwordSelector: "#user-password",
  //   submitSelector: "button[type='submit']",
  //   autoSubmit: false
  // }
];
