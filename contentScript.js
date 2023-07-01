//adds + icon for book mark

(()=>{
    let youtubeLeftControls,youtubePlayer; //function specific local variable like c++
    let currentVideo="";
    let currentVideoBookmarks = []; //stores all current bookmarks in an array

    chrome.runtime.onMessage.addListener((obj,sender,response)=>{ //javascript destructuring
        const {type,value,videoId,note} =obj; //destructuring

        if(type==="NEW"){
            currentVideo = videoId;
            newVideoLoaded();
            console.log("Contenscript new");
        }else if(type === "PLAY"){
            youtubePlayer.currentTime=value;
        }else if(type ==="DELETE"){
            currentVideoBookmarks = currentVideoBookmarks.filter((b)=>b.time!=value);
            chrome.storage.sync.set({[currentVideo]:JSON.stringify(currentVideoBookmarks)}); //updating and sysncing with the chrome local storage
            response(currentVideoBookmarks);//sends back as argument to the call back function viewbookmarks in popup.js
        } else if(type ==="SAVE_NOTE"){
            // console.log("Logging currentVideoBookmarks: ");
            // console.log(currentVideoBookmarks);
            // console.log("Logging currentVideo: ");
            // console.log(currentVideo);
            // console.log("logging vidoeID: ");
            // console.log(videoId);
            // console.log("Logging note: ");
            // console.log(note);
            // console.log("Inside SAVE_NOTE");
            // console.log("With value: ");
            // console.log(value);
            console.log("currentVideoBookmarks: ");
            console.log(currentVideoBookmarks);
            // console.log("currentVideoBookmarks[0].time: ");
            // console.log(currentVideoBookmarks[0].time);
            for(let i=0;i<currentVideoBookmarks.length;i++){
                //converting to string for accurate comparision, or else was not getting was matched even when same 
                if((currentVideoBookmarks[i].time).toString()===value.toString()){ //bookmark found
                    currentVideoBookmarks[i].note =note;
                    console.log("found bookmark with notes: ");
                    console.log(currentVideoBookmarks[i].note);
                    break;
                }
            }
            chrome.storage.sync.set({[currentVideo]:JSON.stringify(currentVideoBookmarks)}); //updating the new info in chrome local storage

        } else if (type ==="GET_SAVED_NOTE"){
            for(let i=0;i<currentVideoBookmarks.length;i++){
                if((currentVideoBookmarks[i].time).toString()===value.toString()){
                    alert(currentVideoBookmarks[i].note);
                    break;
                }
            }
        }
    });

    const fetchBookmarks = () => {
        return new Promise((resolve)=>{ //promise feature of only V3 alt is callback in V2 //returns a promise since retreiving all bookmarks from chrome local storage might take some time
            chrome.storage.sync.get([currentVideo],(obj) =>{ //get(ARG1=key, ARG2=function) , obj return of get i.e. [currentVideo]:....
                //obj[currentVideo] => obj[key], can access key value using obj[key] or obj.key
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]): []); //Normal if else statement used her ? : //This line execution means function has resolved succesfully and return the message,i.e. resolve(message)
                //JSON.parse(obj[currentVideo]), converts the key value(which is a JSON file stored as string using JSON.stringfy()) of key: currentVideo
            });
        });
    }


    const newVideoLoaded = async () => { //async function since it gets promise inside it and waits till the promise is resolved
        const bookmarkBtnExists =document.getElementsByClassName("bookmark-btn")[0];
        currentVideoBookmarks = await fetchBookmarks(); //waits till the promise returned by fetchBookmarks is resolved,
        //if await not done then current bookmark array might not contain all the bookmarks or may even contain garbage values since the chrome storage accessing takes time
        
        if(!bookmarkBtnExists){
            const bookmarkBtn = document.createElement("img");
            bookmarkBtn.src=chrome.runtime.getURL("assets/bookmark.png");  //creates and inserts url of image when the extension is running
            bookmarkBtn.className ="ytp-button"+" bookmark-btn";  //important to give space. else the class name will be "ytp-buttonbookmark-btn" and you won't find the class "bookmark-btn" and continuous appending of child occurs
            bookmarkBtn.title ="Click to bookmark current timestamp!";

            youtubeLeftControls=document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];

            youtubeLeftControls.appendChild(bookmarkBtn);  //adding the button
            bookmarkBtn.addEventListener("click",addNewBookmarkEventHandler); //calling this function whenever the button is clicked
        }
    }

    const addNewBookmarkEventHandler= async ()=>{ // since it gets in promise

        for(let i=0;i<3;i++){ //for loop done to overcome the issue with synchronisation of chrome storage(chrome storage takes time to sync)  (my bruteforce sol)
            
            const currentTime=youtubePlayer.currentTime;
            const newBookmark ={ //creating it as a class
                time: currentTime,
                desc: "Bookmark at " + getTime(currentTime),
                note: "No previous notes. You can write new notes here :)"
            };
    
            currentVideoBookmarks = await fetchBookmarks(); //waits till promise is resolved to get all of the required bookmarks
            
            
    
            console.log(newBookmark);
    
            //below logic till if statement is to makesure that single time as single bookmark so that single id is assigned to single bookmark
            let isNewBookmarkTime = true;
    
            for(let i=0;i<currentVideoBookmarks.length;i++){
                if(currentVideoBookmarks[i].time===currentTime)isNewBookmarkTime=false;
            }
    
            if(isNewBookmarkTime){
                chrome.storage.sync.set({ //sets the data in the chrome local storag, format of using chrome.storage.sync.set(ARG1,ARG2); ARG1=data to be stored in string format("key":"keyValue")(like map in c++), ARG2 any function call along with storage
                    //here, [currentVideo] rep value of currentVideo var, without bracket currentVideo => "currentVideo"
                   [currentVideo]:JSON.stringify([...currentVideoBookmarks,newBookmark].sort((a,b)=>a.time - b.time)) 
                   //alternative of .sort
                });//using spread operator (...) to access all the elements of the currentVideobookmarks array and [...currentVideobookmarks,newBookmark] concatenates the contents
            }

        }

    }

    //below is the code for handling edge cases
    //the code below is executed whenever the content_scripts (of manifest.json) matches youtube.com 
    newVideoLoaded(); //if not written, when we refresh the page the button may not be added
    console.log("Working contentScript?");
    
})();

const getTime = (t) =>{  //conveting seconds to youtube time format
    var date = new Date(0);  //already available javascript method calling Date(0) constructor
        date.setSeconds(t);
    
    return date.toISOString().substring(11,19); //toISOString() converts the time to ISO std. string format of date and time
    //ISO standard string time format '1970-01-01T00:00:00.000Z' (without setting any seconds)
};
