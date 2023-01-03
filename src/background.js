//1120/21
//なぜかURLがhttps://www.wolframalpha.com/input/?i=だとできないので
//https://ja.wolframalpha.com/input/?i=に変更
//ここ田岡
chrome.browserAction.onClicked.addListener(doActionButton);

function doActionButton(tab){
    console.log('Action Button clicked. Tab:',tab);
}

chrome.commands.onCommand.addListener(function(command) {
    //Polyfill the Browser Action button
    if(command === '_execute_browser_action') {
        chrome.tabs.query({active:true,currentWindow:true},function(tabs){
            //Get the popup for the current tab
            chrome.browserAction.getPopup({tabId:tabs[0].id},function(popupFile){
                if(popupFile){
                    openPopup(tabs[0],popupFile);
                } else {
                    //There is no popup defined, so we do what is supposed to be done for
                    //  the browserAction button.
                    doActionButton(tabs[0]);
                }
            });
        });
        return;
    } //else
});
//田岡



// allows us to redirect to the install page


if (!localStorage["returnUser"]){

    // set default options

    localStorage["open_in"] = "newtab";
    localStorage["showTips"] = "true";
    localStorage["returnUser"] = "true";

}

/*
	function selectionOnClick
	- sends selected text to Wolfram|Alpha
 */

function selectionOnClick(info, tab) {
    sendTextToWA(info.selectionText);
}

/*
	function sendTextToWA
	- opens a tab underneath to W|A using the supplied input
	- used by selection context menu
 */

function sendTextToWA(inString) {

    var input = encodeURIComponent(inString);
    optionedWA(input);

}

// helper function to deal with the "open in" option

function optionedWA(input) {

    if (localStorage["open_in"] == "sametab") {
        chrome.tabs.getSelected( undefined, function(tab) {
            chrome.tabs.update(tab.id, {url: "https://ja.wolframalpha.com/input/?i="+input}, undefined);
        });
    } else {
        chrome.tabs.create({"url" : "https://ja.wolframalpha.com/input/?i=" + input, "active" : true});
    }

}


function inputChangedWA(inString, suggest) {
    if (inString=="") {
        return;
    }

    var input = encodeURIComponent(inString);
    var autoUrl =  "https://ja.wolframalpha.com/n/v1/api/autocomplete?i=" + input;

    $.ajax(autoUrl, {
        "dataType" : "json",
        "success" : function (jsonData) {

            //turn into SuggestResult array
            var resultsFromJson = jsonData.results;
            if(resultsFromJson.length == 0) {return;} // if we have no suggestions
            var suggestFromJson = []; //array of SuggestResult objects
            var len = Math.min(5, resultsFromJson.length); // max 5 suggestions
            for (i = 0; i < len; i++) {

                var descripString = resultsFromJson[i].input;

                suggestFromJson.push({
                    "content" : resultsFromJson[i].input,
                    "description" : descripString
                });
            }

            suggest(suggestFromJson);
        }
    });
}

/*
	function omniWA
	- naviagates current tab to W|A
	- used by omnibox
 */

function omniWA(inString) {
    if (inString=="") {
        if (localStorage["open_in"] == "sametab") {
            chrome.tabs.getSelected( undefined, function(tab) {
                chrome.tabs.update(tab.id, {url: "https://ja.wolframalpha.com/"}, undefined);
                window.close();
            });
        } else {
            chrome.tabs.create({"url" : "https://ja.wolframalpha.com/", "active" : true});
        }
    } else {
        var input = encodeURIComponent(inString);
        chrome.tabs.getSelected( undefined, function(tab) {
            chrome.tabs.update(tab.id, {url: "https://ja.wolframalpha.com/input/?&i="+input}, undefined);
        });
    }
}

// right click context menu
chrome.contextMenus.create({
    "title" : "Compute '%s' with Wolfram|Alpha",
    "contexts" : ["selection"],
    "onclick" : selectionOnClick
});

//"omnibox" (reacting to users entering "=" in the URL input box)
chrome.omnibox.onInputEntered.addListener(omniWA);
chrome.omnibox.setDefaultSuggestion({"description" : "Compute '%s' with Wolfram|Alpha"});
chrome.omnibox.onInputChanged.addListener(inputChangedWA);
