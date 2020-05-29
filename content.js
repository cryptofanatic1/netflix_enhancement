var globalUserSettings;
var syncedSettings = ["profile",
                      "hiddenGenres",
                      "hiddenContinueWatching",
                      "enableAutoProfileSelect",
                      "enableContinueWatching"];
var continueWatchingOptionsAdded = false;

init()

function getUserSettings(callback) {
    chrome.storage.sync.get(syncedSettings, 
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

function saveUserProfile(profile) {
    var profileSpan = profile.find("span.profile-name");
    saveUserSettings({"profile":profileSpan.innerText});
    saveUserSettings({"enableAutoProfileSelect":1});
    clickProfile(profileSpan);
}

function addSaveProfileOption() {
    $("div.avatar-wrapper").each(function() {
        var tooltip = $("<span style='display:none' class='dropdown-content' role='status' aria-live='assertive'>\
                                        Always use this profile?</span>");
        var profile = $(this);
        profile.append(tooltip);
        profile.hover(function() {
            tooltip.stop(true, false, true).fadeToggle(300)
                   .click(function() {saveUserProfile(profile);})
        });
    });
}

function hideShow(obj) {
    $(obj).remove();
}

function hideContinueWatchingShows(show) {
    var title = $(show).find("a.slider-refocus").attr("aria-label");
    if (typeof globalUserSettings != "undefined") {
        if (globalUserSettings.hasOwnProperty("hiddenContinueWatching") &&
            globalUserSettings.enableContinueWatching == 1)
        {
            if (globalUserSettings.hiddenContinueWatching.findIndex(function(e) {return e==title;}) != -1) {
                hideShow(show);
            }
        }
    }
}

function saveHiddenShow(title) {
    if (typeof globalUserSettings != "undefined") {
        if (globalUserSettings.hasOwnProperty("hiddenContinueWatching")) {
            if (globalUserSettings.hiddenContinueWatching.findIndex(function(e) {return e==title;}) == -1) {
                globalUserSettings.hiddenContinueWatching.push(title);
                saveUserSettings({"hiddenContinueWatching":globalUserSettings.hiddenContinueWatching});
            }
        }
        else {
            var list = [title];
            saveUserSettings({"hiddenContinueWatching":list});
        }
    }
}

function createHideShowButton(obj) {
    setTimeout(function() {
        var buttons = $(obj).find(".ActionButtons");
        //make new added button lower index so that tool tips will appear on top of it
        buttons.append("<div class='nf-svg-button-wrapper' style='position:relative; z-index:0'>\
                            <a role='link' class='nf-svg-button simpleround'>\
                                <svg class='svg-icon svg-icon-mylist-add' focusable='true' transform='rotate(45)'>\
                                    <use filter xlink:href='#mylist-add'></use></svg></a>\
                            <span class='nf-svg-button-tooltip' role='status' aria-live='assertive'>\
                            Hide from Continue Watching</span></div>")
        
               .click(function() {
                    saveUserSettings({"enableContinueWatching":1});
                    var title = $(obj).find(".bob-jaw-hitzone").attr("aria-label");
                    saveHiddenShow(title);
                    hideShow($(obj));
                });
    }, 600);
}

function handleContinueWatching(userSettings) {
    if (typeof userSettings == "undefined" || continueWatchingOptionsAdded) {
        return;
    }

    $("div.lolomoRow").each(function() {
        if ($(this).attr("data-list-context") == "continueWatching") {
            continueWatchingOptionsAdded = true;
            $(this).find("div.slider-item").each(function() {
                hideContinueWatchingShows($(this));
                $(this).hover(function() {
                    createHideShowButton($(this));
                })
            })
        }
    })
}

//search google with query, return first result that contains parseUrl
//asynchronously wait for callback to complete so that link is valid
async function searchGoogle(query, parseUrl) {
    return await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({id: 'fetchGoogle',
                                    query: query},
                                   function(response) {
            var link = "undefined";
            var dom = $.parseHTML(response);
            var body = $(dom).filter("#main");
            $(body).find(".r").each(function() { //each result
                var dontBreakLoop = true;
                $(this).find("a").each(function() { //each link
                    var testLink = $(this).attr("href");
                    if (testLink.indexOf(parseUrl) > -1) {
                        link = testLink;
                        dontBreakLoop = false; //break outerloop
                        return false; //break
                    }
                });
                return dontBreakLoop;
            });

            resolve(link);
        });
    });
}

function displayRottenTomato(show, rating) {
    console.log(rating);
    var svg = "images/rotten_tomato.svg";
    if (parseInt(rating.slice(0,-1)) < 60) {
        svg = "images/rotten.svg"
    }
    $(show).append("<img src='" + chrome.runtime.getURL(svg) + "' class='rottenTomato'></im>");
    $(show).append("<span class='rottenTomatoRating'>" + rating + "</span>");
}

function scrapeRottenTomatoes(show, query) {
    chrome.runtime.sendMessage({id: 'fetchRottenTomatoes',
                                query: query},
                               function(response) {
        var link = "undefined";
        var dom = $.parseHTML(response);
        var body = $(dom).filter("div.body_main");
        var rating = $(body).find(".mop-ratings-wrap__percentage").first().text().trim();
        displayRottenTomato(show, rating);
    });
}

function addRottenTomatoes(userSettings) {
    $("#row-1").each(function() {
        $(this).find("div.slider-item").each(function() {
            var show = $(this);
            var title = show.find("a.slider-refocus").attr("aria-label");
            if (title != undefined) {
                searchGoogle("rotten tomatoes " + title, "rottentomatoes")
                    .then(function(link) {
                        console.log(link);
                        if (link == "undefined" || (link.indexOf("/m/") == -1 && link.indexOf("/tv/") == -1) ) {
                            return;
                        }
                        var query = link.slice(link.indexOf(".com")+4);
                        scrapeRottenTomatoes(show, query);
                    });
                
            }
        });
    });
}

//This function needs to be called repeated times when new DOM elements are added
function mainPageSetupRepeat() {
    hideGenres(globalUserSettings);
    handleContinueWatching(globalUserSettings);
}

function mainPageSetup() {
    mainPageSetupRepeat();
    addRottenTomatoes(globalUserSettings);
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