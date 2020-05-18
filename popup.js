var profileEnable = 0;
var trailerEnable = 0;
var continueWatchingEnable = 0;

function saveUserSettings(obj) {
    chrome.storage.sync.set(obj, function() {
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

function setTrailer(val) {
    trailerEnable = val;
    trailerSlider();
}

function toggleTrailer() {
    trailerEnable = (trailerEnable+1)%2;
    trailerSlider();
    saveUserSettings({"enableTrailer":trailerEnable});
}

function trailerSlider () {
    if (trailerEnable) {
        $("#trailerSliderButton").css("background-color", "white");
        $("#trailerSlider").removeClass("sliderColorDeactive");
        $("#trailerSlider").addClass("sliderColorActive");
        $("#trailerSliderButton").animate({
            left:"15px"
        }, 500);
    }

    else {
        $("#trailerSliderButton").css("background-color", "white");
        $("#trailerSlider").removeClass("sliderColorActive");
        $("#trailerSlider").addClass("sliiderColorDeactive");
        $("#trailerSlider").css("background-color", "#F0F0F0");
        $("#trailerSliderButton").animate({
            left:"0px"
        }, 500);
    }
}

function setContinueWatching(val) {
    continueWatchingEnable = val;
    continueWatchingSlider();
}

function toggleContinueWatching() {
    continueWatchingEnable = (continueWatchingEnable+1)%2;
    continueWatchingSlider();
    saveUserSettings({"enableContinueWatching":continueWatchingEnable});
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

function populateMenuSettings(settings) {
    if (settings.enableAutoProfileSelect) {
        setProfile(settings.enableAutoProfileSelect);
    }
    if (settings.enableTrailer) {
        setTrailer(settings.enableTrailer);
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

    $("#trailerSliderCover").click(function() {
        toggleTrailer();
    })

    $("#continueWatchingSliderCover").click(function() {
        toggleContinueWatching();
    })

    chrome.storage.sync.get(["profile", "hiddenGenres", "enableAutoProfileSelect", "enableTrailer", "enableContinueWatching"], 
        function(settings) {
            console.log("User Settings", settings)
            populateMenuSettings(settings);
        }
    );
})   