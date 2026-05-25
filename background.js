// Listen for when the user clicks the extension icon in the toolbar
chrome.action.onClicked.addListener(() => {
  // Open our index.html file in a brand new tab
  chrome.tabs.create({
    url: "index.html",
  });
});
