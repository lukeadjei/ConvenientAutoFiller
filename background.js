// background.js
// This is the extension's "service worker" — Chrome's term for a background script in MV3.
//
// Key thing to understand: unlike a normal JS file, this script is not always running.
// Chrome wakes it up when an event fires, it handles the event, then it goes to sleep.
// This means you CANNOT store data in global variables here and expect them to persist.
// Always use chrome.storage.local for anything that needs to survive between events.
//
// For this extension, the background script's role is minimal.
// The real work happens in content.js (filling forms) and popup.js (managing credentials).

chrome.runtime.onInstalled.addListener(() => {
  console.log("AutoFiller installed and ready.");
});
