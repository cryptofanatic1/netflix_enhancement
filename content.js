var globalUserSettings
// saveUserSettings({profile:["Thomas"]})
init()

function getUserSettings(callback) {
    chrome.storage.sync.get(["profile", "hiddenGenres", "enableAutoProfileSelect", "enableTrailer", "enableContinueWatching"], 
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

function deleteSavedProfile() {
    chrome.storage.sync.remove("profile", function() {
        console.log("Delete saved profile")
    })
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

function createTrailer(obj) {
    var vId
    var trailerDiv = "<div class='trailer'></div>"
    obj.find("div.bob-outline").append(trailerDiv)
    obj.find("div.bob-overlay").hide()
    var title = obj.find("div.video-preload-title-label").text()
    var search = title + " official trailer"
    console.log("search: ", search);
    // var xhr = new XMLHttpRequest();
    // xhr.open("GET", "https://www.youtube.com/embed/?listType=search&list=" + search, true);
    // xhr.onreadystatechange = function() {
    //     if (this.readyState == 4) {
    //         console.log("resonse text: ", xhr.responseText)
    //         var dom =  $.parseHTML(xhr.responseText);
    //         var body = $(dom).filter("#body-container")
    //         console.log("body: ", body);
    //         var results = body.find("#results")
    //         console.log("results: ", results);
    //         var links = results.find("a.yt-uix-sessionlink")
    //         links.each(function() {
    //             var href = $(this).attr("href")
    //             if (href.indexOf("watch?v") != -1) {
    //                 var firstLink = href
    //                 vId = firstLink.slice(firstLink.indexOf("v=")+2, firstLink.length)
    //                 return false //break out of each loop
    //             }
    //         })
    //         $(".trailer").append("<iframe width='100%' height='100%' src='https://www.youtube.com/embed/" + vId + "?autoplay=1&controls=0&showinfo=0'> </iframe>")
    //     }
    // }
    // xhr.send()
    $(".trailer").append("<iframe width='100%' height='100%' src='https://www.youtube.com/embed/?listType=search&list=" + search + "&autoplay=1&controls=1&showinfo=0'> </iframe>")
}

function createTrailerButton(obj) {
    var buttons = $(obj).find("div.bob-button-wrapper")
    console.log("buttons ", buttons)
    buttons.append("<div class='test'></div>")
    console.log(buttons)
}

function addHoverTrailers() {
    if (globalUserSettings.enableTrailer) {
        var timer
        $("div.slider-item").each(function() {
            var item = $(this)
            if (item.data("addedHover") != 1) {
                item.hover(function() {
                    createTrailerButton(item)
                })
            //     item.hover(function() {
            //         timer = setTimeout(function() {
            //             createTrailer(item)
            //         }, 2000)
            //     }, function() {
            //         clearTimeout(timer)
            //     })
            }
            item.data("addedHover", 1) //only add trailer once
        })
    }
}

function addHideFromContinueWatchingOption() {
    if (globalUserSettings.enableContinueWatching) {
        var timer
        $("div.slider-item").each(function() {
            console.log("adding continue watching menu", $(this));
            var item = $(this)
            item.append($("<ul style='display:none' class='dropdown-content'><li><span>Hide this show?</span></li></ul>"))
            item.hover(function() {
                item.children('ul').stop(true, false, true).fadeToggle(300)
                                    .click(function() {saveHiddenShow(list)});
            })
        })
    }
}

function mainPageSetup() {
    hideGenres(globalUserSettings);
    addHoverTrailers();
    // addHideFromContinueWatchingOption();
}

function setup(userSettings) {
    globalUserSettings = userSettings //save setings for later on document load
    if ($(".list-profiles")[0]) {
        //Profile selection page setup
        $("a.profile-link").each(function() {
            $(this).click(function() {
                setTimeout(function() {mainPageSetup();}, 100);//main page setup needs to run after clicking profile
                setTimeout(function() {mainPageSetup();}, 8000);//run again much later after all shows have loaded into dom
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
        mainPageSetup() //run 2nd time as new rows have loaded
    }
});