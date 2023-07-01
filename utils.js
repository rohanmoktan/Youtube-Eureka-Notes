//getting current tab  

export async function getActiveTabURL() { //like header in c++, for more reusability of same code in different different situations
    let queryOptions = { active: true, currentWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }