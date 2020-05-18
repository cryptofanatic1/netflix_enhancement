var globalUserSettings
init()

function getUserSettings(callback) {
    chrome.storage.sync.get(["profile", "hiddenGenres", "enableAutoProfileSelect", "enableContinueWatching"], 
        function(settings) {
            console.log("User Settings", settings)
            callback(settings)
        }
    );
}

function saveUserSettings(obj) {
    chrome.storage.sync.set(obj, function() {
    });
}

function clearUserSettings() {
    chrome.storage.sync.clear(function() {
        console.log("clear user settings")
    });
}

function removeRow(genre) {
    $(".lolomoRow_title_card").each( function() {
        var rowType = $(this).attr("data-list-context")
        if (rowType && rowType.indexOf(genre) != -1) {
            console.log("removing genre", genre)
            $(this).css("display", "none")
        }
    });
}

function hideGenres(userSettings) {
    if (typeof userSettings != "undefined" && userSettings.hasOwnProperty("hiddenGenres")) {
        for (i=0; i<userSettings.hiddenGenres.length; i++) {
            removeRow(userSettings.hiddenGenres[i]);
        }
    }
}

function clickProfile(profileSpan) {
    if (typeof profileSpan != "undefined") {
        var profileLink = profileSpan.parents("a");
        if (typeof profileLink != "undefined" && typeof profileLink[0] != "undefined")
            profileLink[0].click();
    }
}

function saveUserProfile(li) {
    var profileSpan = li.find("span.profile-name")
    saveUserSettings({"profile":profileSpan[0].innerText})
    saveUserSettings({"enableAutoProfileSelect":1})
    clickProfile(profileSpan);
}

function addSaveProfileOption() {
    $("li.profile").each(function() {
        var list = $(this)
        list.append($("<ul style='display:none' class='dropdown-content'><li><span>Always use this profile?</span></li></ul>"))
        list.hover(function() {
	        list.children('ul').stop(true, false, true).fadeToggle(300)
                                  .click(function() {saveUserProfile(list)});
        });
    })
}

function addHideFromContinueWatchingOption() {
    if (globalUserSettings.enableContinueWatching) {
        var timer
        $("div.slider-item").each(function() {
            var item = $(this)
            item.append($("<ul style='display:none' class='dropdown-content'><li><span>Hide this show?</span></li></ul>"))
            item.hover(function() {
                item.children('ul').stop(true, false, true).fadeToggle(300)
                                    .click(function() {saveHiddenShow(list)});
            })
        })
    }
}

//This function needs to be called repeated times when new DOM elements are added
function mainPageSetupRepeat() {
    hideGenres(globalUserSettings);
}

function mainPageSetup() {
    mainPageSetupRepeat();
    addHideFromContinueWatchingOption();
}

function setup(userSettings) {
    globalUserSettings = userSettings //save setings for later on document load
    if ($(".list-profiles")[0]) {
        //Profile selection page setup
        $("a.profile-link").each(function() {
            $(this).click(function() {
                setTimeout(function() {mainPageSetupRepeat();}, 100);//main page setup needs to run after clicking profile
                setTimeout(function() {mainPageSetupRepeat();}, 8000);//run again much later after all shows have loaded into dom
            })
        })
        if (typeof userSettings != "undefined" && userSettings.hasOwnProperty("profile")
                                               && userSettings.enableAutoProfileSelect) {
            var profileSpan = $("span.profile-name").filter(function() { 
                                return ($(this).text().indexOf(userSettings.profile[0]) > -1)
                              });
            clickProfile(profileSpan)
        }
        else {
            addSaveProfileOption()
        }
    }
    else {
        mainPageSetup();  //run 1st time on initial page load
    }
}

function init() {
    getUserSettings(setup) //get settings first and then do actual setup as async cb
}

$( document ).ready(function() {
    console.log( "document loaded", globalUserSettings);
    if (!$(".list-profiles")[0]) {
        mainPageSetupRepeat() //run 2nd time as new rows have loaded
    }
});