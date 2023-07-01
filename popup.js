import { getActiveTabURL } from "./utils.js";

const bookmarksElement  = document.getElementById("bookmarks");

const addNewBookmark = (bookmark) => {
    const bookmarkFullenvelop =document.createElement("div");
    const bookmarkTitleElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
    const controlsElement = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";

    controlsElement.className="bookmark-controls";

    newBookmarkElement.id = "bookmark-"+bookmark.time;
    bookmarkFullenvelop.id=newBookmarkElement.id + "-Full";
    newBookmarkElement.className ="bookmark";
    newBookmarkElement.setAttribute("timestamp",bookmark.time);

    //appending the control buttons
    setBookmarkAttributes("note",onNote, controlsElement);
    setBookmarkAttributes("play",onPlay, controlsElement);
    setBookmarkAttributes("delete",onDelete,controlsElement);

    //appending the notes section
    const notes =document.createElement("div");
    notes.className = "notes";
    notes.id="notes-"+bookmark.time;
    notes.setAttribute("timestamp",bookmark.time);
    // notes.innerText="this will be notes";
    //check for the saved line
    notes.innerHTML ="<textarea id ='saveLine-"+bookmark.time+"'></textarea><input type='button' class='btn' id='saveButton-"+bookmark.time+"' value='Save'><input type ='button' class='btn' id='getSavedNote-"+bookmark.time+"' value='Get saved note'>";
    

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarkFullenvelop.appendChild(newBookmarkElement);
    bookmarkFullenvelop.appendChild(notes); //appending the notes section
    notes.style.display="none"; //by default keeping the display none
    bookmarksElement.appendChild(bookmarkFullenvelop);
};

const viewBookmarks = (currentBookmarks = []) => { // assuming input to be initially empty
    bookmarksElement.innerHTML ="";

    if(currentBookmarks.length>0){
        for(let i=0;i<currentBookmarks.length;i++){
            const bookmark =currentBookmarks[i];
            // addNewBookmark
            addNewBookmark(bookmark);
        }
    }else {// if currentBookmarks is empty
        bookmarksElement.innerHTML = "<i class = 'row'> No bookmarks to show</i>";
    }
};

const onPlay = async (e) => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL();

    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime
    })
};

const onDelete = async (e) => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp"); 
    const activeTab = await getActiveTabURL();
    
    const bookmarkElementToDelete = document.getElementById("bookmark-"+bookmarkTime+"-Full"); //need to change

    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

    chrome.tabs.sendMessage(activeTab.id,{
        type:"DELETE",
        value: bookmarkTime
    },viewBookmarks); //viewBookmarks function as a call back function to refresh and show the immediate update of bookmark
};

const getSavedNoteFun =async (e)=>{
    const bookmarkTime = e.target.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL();

    chrome.tabs.sendMessage(activeTab.id,{
        type: "GET_SAVED_NOTE",
        value: bookmarkTime
    });
};
 
const save = async (e)=>{
    const bookmarkTime = e.target.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL();
    
    let savedValue =document.getElementById("saveLine-"+bookmarkTime).value;

    chrome.tabs.sendMessage(activeTab.id,{
        type: "SAVE_NOTE",
        value: bookmarkTime,
        note: savedValue
    });
    
};

const onNote = (e) =>{
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarkElementToToggle=document.getElementById("notes-"+bookmarkTime);

    if(bookmarkElementToToggle.style.display==="none"){
        bookmarkElementToToggle.style.display="block";
    }else bookmarkElementToToggle.style.display="none";

    //adding functionality to save button
    const saveButton = document.getElementById("saveButton-"+bookmarkTime);
    if(saveButton){
        saveButton.addEventListener("click",save);
    }

    //adding functionality to get saved note button
    const getSavedNote = document.getElementById("getSavedNote-"+bookmarkTime);
    if(getSavedNote){
        getSavedNote.addEventListener("click",getSavedNoteFun);
    }
};



//adding play and delete button
const setBookmarkAttributes =  (src,eventListener,controlParentElement) => { //src general term for string : "play" , "delete", eventListener means the function onPlay or onDelete
    const controlElement = document.createElement("img");
    controlElement.src = "assets/"+src+".png";
    controlElement.title = src;
    controlElement.addEventListener("click",eventListener);
    controlParentElement.appendChild(controlElement);
};


document.addEventListener("DOMContentLoaded", async() => {  //check if current active tab is youtube video page (display bookmark) or not (say not a yt vid page)
    const activeTab = await getActiveTabURL(); //using utils.js 's imported function
    const queryParameters=activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    if(activeTab.url.includes("youtube.com/watch") && currentVideo){ //checking if current active tab is yt vid page and the currentVideo length>0 
        chrome.storage.sync.get([currentVideo], (data) =>{
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
            //viewBookmarks
            viewBookmarks(currentVideoBookmarks);
        })
    }else {
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
    }

});
