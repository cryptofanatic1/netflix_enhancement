var syncedSettings = ["profile",
                      "hiddenGenres",
                      "hiddenContinueWatching",
                      "enableAutoProfileSelect",
                      "enableContinueWatching"];

var profileEnable = 0;
var continueWatchingEnable = 0;

function saveUserSettings(obj) {
    chrome.storage.sync.set(obj, function() {
    });
}

function refreshWindow() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
    });
}

function setProfile(val) {
    profileEnable = val;
    profileSlider();
}

function toggleProfile() {
    profileEnable = (profileEnable+1)%2;
    profileSlider();
    saveUserSettings({"enableAutoProfileSelect":profileEnable});
}

function profileSlider () {
    if (profileEnable) {
        $("#profileSliderButton").css("background-color", "white");
        $("#profileSlider").removeClass("sliderColorDeactive");
        $("#profileSlider").addClass("sliderColorActive");
        $("#profileSliderButton").animate({
            left:"15px"
        }, 500);
    }

    else {
        $("#profileSliderButton").css("background-color", "white");
        $("#profileSlider").removeClass("sliderColorActive");
        $("#profileSlider").addClass("sliiderColorDeactive");
        $("#profileSlider").css("background-color", "#F0F0F0");
        $("#profileSliderButton").animate({
            left:"0px"
        }, 500);
    }
}

function clearSavedProfileButton() {
    $("#clearSavedProfileConfirm").css({"display":"block"});
    $("#clearSavedProfile").text("Are you sure?");
    $("#clearSavedProfileConfirm").animate({
        'left' : '10px'
    }, 750, function() {
        $("#clearSavedProfileConfirm").css({"z-index":"1"});
    });
}

function clearSavedProfile(confirm) {
    if (confirm) {
        chrome.storage.sync.remove(["profile"], function() {
            console.log("Deleting saved profile");
        });    
    }
    $("#clearSavedProfileConfirm").css({"z-index":"-1"});
    $("#clearSavedProfile").text("Clear Saved Profile");
    $("#clearSavedProfileConfirm").animate({
        'left' : '-80px'
    }, 750, function() {
        $("#clearSavedProfileConfirm").css({"display":"none"});
    });
}

function setContinueWatching(val) {
    continueWatchingEnable = val;
    continueWatchingSlider();
}

function toggleContinueWatching() {
    continueWatchingEnable = (continueWatchingEnable+1)%2;
    continueWatchingSlider();
    saveUserSettings({"enableContinueWatching":continueWatchingEnable});
    refreshWindow();
}

function continueWatchingSlider () {
    if (continueWatchingEnable) {
        $("#continueWatchingSliderButton").css("background-color", "white");
        $("#continueWatchingSlider").removeClass("sliderColorDeactive");
        $("#continueWatchingSlider").addClass("sliderColorActive");
        $("#continueWatchingSliderButton").animate({
            left:"15px"
        }, 500);
    }

    else {
        $("#continueWatchingSliderButton").css("background-color", "white");
        $("#continueWatchingSlider").removeClass("sliderColorActive");
        $("#continueWatchingSlider").addClass("sliiderColorDeactive");
        $("#continueWatchingSlider").css("background-color", "#F0F0F0");
        $("#continueWatchingSliderButton").animate({
            left:"0px"
        }, 500);
    }
}

function restoreContinueWatchingButton() {
    $("#restoreContinueWatchingConfirm").css({"display":"block"});
    $("#restoreContinueWatching").text("Are you sure?");
    $("#restoreContinueWatchingConfirm").animate({
        'left' : '10px'
    }, 750, function() {
        $("#restoreContinueWatchingConfirm").css({"z-index":"1"});
    });
}

function restoreContinueWatching(confirm) {
    if (confirm) {
        chrome.storage.sync.remove(["hiddenContinueWatching"]);
        refreshWindow();   
    }
    $("#restoreContinueWatchingConfirm").css({"z-index":"-1"});
    $("#restoreContinueWatching").text("Restore Continue Watching");
    $("#restoreContinueWatchingConfirm").animate({
        'left' : '-80px'
    }, 750, function() {
        $("#restoreContinueWatchingConfirm").css({"display":"none"});
    });
}

function populateMenuSettings(settings) {
    if (settings.enableAutoProfileSelect) {
        setProfile(settings.enableAutoProfileSelect);
    }
    if (settings.enableContinueWatching) {
        setContinueWatching(settings.enableContinueWatching);
    }
}

$(document).ready(function(){
    $("#profileSliderCover").click(function() {
        toggleProfile();
    })

    $("#clearSavedProfile").click(function() {
        clearSavedProfileButton();
    }) 

    $("#clearSavedProfileConfirmYes").click(function() {
        clearSavedProfile(1);
    }) 
    $("#clearSavedProfileConfirmNo").click(function() {
        clearSavedProfile(0);
    }) 

    $("#continueWatchingSliderCover").click(function() {
        toggleContinueWatching();
    })

    $("#restoreContinueWatching").click(function() {
        restoreContinueWatchingButton();
    }) 

    $("#restoreContinueWatchingConfirmYes").click(function() {
        restoreContinueWatching(1);
    }) 
    $("#restoreContinueWatchingConfirmNo").click(function() {
        restoreContinueWatching(0);
    }) 

    chrome.storage.sync.get(syncedSettings, 
        function(settings) {
            console.log("User Settings", settings)
            populateMenuSettings(settings);
        }
    );
})   