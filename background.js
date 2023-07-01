


    // your background.js code
    //tells the content script whether current tab is yt tab (works in backgroung)
chrome.tabs.onUpdated.addListener((tabId,tab) => {  
    //fires the iife(using arrow operator)
    //here tabId is the id of updated tab,tab contains the info of the tab 
    
    if(tab.url && tab.url.includes("youtube.com/watch")) {  //tab.url is used to make sure url exists (exception: //settings, extensions in chrome) or else tab.url.includes gives garbage
        const queryParameters = tab.url.split("?")[1];  //gets right side split
        const urlParameters = new URLSearchParams(queryParameters);//URLSearchParams is already existing javascript method for getting data from url (object)
          //creating an object named urlParameters assigning the object/constructor input, using new
        console.log(urlParameters);
        console.log("Inside for loop!");

        chrome.tabs.sendMessage(tabId, { //send message sends tabId, message(object)
            type: "NEW",
            videoId: urlParameters.get("v"), //get function gets the value of key=v in object urlParameters
        });
    }
    else console.log("Not working .url :(");
});
  
console.log("Background content getting tabs")
