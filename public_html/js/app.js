// Array in which navigation history is saved
var searches = [];
searches.push('');
var indexSearches = 0;

var searchType = 3;
var autosaveHistory = false;
var wordSaved = false;


var callbackThemesClose;

document.addEventListener('DOMContentLoaded', function() {
    enableOrDisableSearchButton();
    
    // Change searchType on select selection
    document.getElementById('typeSelect').onchange = changeSearchType;
    // Autosave history on/off
    document.getElementById('autosaveInput').onchange = changeAutosave;
    
    
    // Enable/disable search button
    var inputSearch = document.getElementById('inputSearch');
    inputSearch.onkeyup = enableOrDisableSearchButton;
    inputSearch.oninput = enableOrDisableSearchButton;

    // Search a term when form is submited
    var form = document.getElementById('searchForm');
    var iFrame = document.getElementById('iframe');
    // Back and forward buttons
    var backButton = document.getElementById('iframeBack');
    var forwardButton = document.getElementById('iframeForward');
    
	form.onsubmit = searchDefinition;

    // Back and forward buttons events
    backButton.onclick = function() {
        //iFrame.contentWindow.history.back(); 
        if (indexSearches > 0) {
            var searchInput = document.getElementById('inputSearch');
            searchInput.value = searches[--indexSearches];
            iFrame.setAttribute('src', getURLRAE(searchInput.value));
            forwardButton.disabled = false;
        }
        if (indexSearches === 0) {
            backButton.disabled = true;
        }
        updateWordSaved();
    };
    var forwardButton = document.getElementById('iframeForward');
    forwardButton.onclick = function() {
        //iFrame.contentWindow.history.forward();
        if (indexSearches < (searches.length - 1)) {
            var searchInput = document.getElementById('inputSearch');
            searchInput.value = searches[++indexSearches];
            iFrame.setAttribute('src', getURLRAE(searchInput.value));
            backButton.disabled = false;
        }
        if (indexSearches === searches.length - 1) {
            forwardButton.disabled = true;
        }
        updateWordSaved();
    };
    
    // About show
    var openAbout = document.getElementById('showAbout');
    openAbout.onclick = function() {
        var aboutDialog = document.getElementById('about');
        aboutDialog.className = '';
    };
    
    // About close
    var closeAboutButton = document.getElementById('closeAbout');
    closeAboutButton.onclick = function() {
        var aboutDialog = document.getElementById('about');
        aboutDialog.className = 'hidden';
        // 2 backs to go to the panel instead the drawer
        back();
        back();
    };
    
    // Themes show
    var openThemes = document.getElementById('showThemes');
    openThemes.onclick = function() {
        var themesDialog = document.getElementById('themes');
        themesDialog.className = themesDialog.className.replace('hidden', '');
    };
    
    // Themes close
    callbackThemesClose = function() {
        var themesDialog = document.getElementById('themes');
        themesDialog.className += ' hidden';
        // 2 backs to go to the panel instead the drawer
        back();
        back();
    };
});

function clearInput(input) {
    input.value = '';
    enableOrDisableSearchButton();
}

function changeTab(tab) {
    if (tab === 1) {
        changeDrawerClass('raeDrawer');
        document.getElementById('menuEdit').className = 'hidden';
    } else if (tab === 2) {
        changeDrawerClass('mainDrawer');
        document.getElementById('menuEdit').className = '';
    } else if (tab === 3) {
        changeDrawerClass('mainDrawer');
        document.getElementById('menuEdit').className = 'hidden';
    }
}

function changeSearchType() {
    var newValue = document.getElementById('typeSelect').value;
    searchType = newValue;
    
    // Store value in database
    var objectStore = db.transaction(['searchType'], 'readwrite').objectStore('searchType');
    objectStore.get('searchType').onsuccess = function(event) {
        var data = event.target.result;
        data.type = searchType;
        
        objectStore.put(data);
    };
}

function changeAutosave() {
    var newValue = document.getElementById('autosaveInput').checked;
    autosaveHistory = newValue;
    
    // Store value in database
    var objectStore = db.transaction(['autosaveHistory'], 'readwrite').objectStore('autosaveHistory');
    objectStore.get('autosave').onsuccess = function(event) {
        var data = event.target.result;
        data.val = autosaveHistory;
        
        objectStore.put(data);
    };
    
    // show/hide save/remove button
    saveOrRemoveButton();
}

// Show correct history button
function saveOrRemoveButton() {
    var removeButton = document.getElementById('removeWordFromHistory');
    var addButton = document.getElementById('addWordToHistory');
    var word = searches[indexSearches];
    if (autosaveHistory || !word) {
        // Hide 2 buttons if there isn't word of it is autosaved
        if (removeButton.className.indexOf('hidden') === -1) {
            removeButton.className += ' hidden';
        }
        if (addButton.className.indexOf('hidden') === -1) {
            addButton.className += ' hidden';
        }
    } else {
        if (wordSaved) {
            if (removeButton.className.indexOf('hidden') > -1) {
                removeButton.className = removeButton.className.replace('hidden', '');
            }
            if (addButton.className.indexOf('hidden') === -1) {
                addButton.className += ' hidden';
            }
        } else {
            if (addButton.className.indexOf('hidden') > -1) {
                addButton.className = addButton.className.replace('hidden', '');
            }
            if (removeButton.className.indexOf('hidden') === -1) {
                removeButton.className += ' hidden';
            }
        }
    }
}

// Update correct value of wordSaved searching in history tab and call saveOrRemoveButton
function updateWordSaved() {
    var word = searches[indexSearches];
    var now = new Date();
    var nowString = now.getFullYear() + '-' + (now.getMonth() + 1 > 9 ? (now.getMonth() + 1) : '0' + (now.getMonth() + 1))
            + '-' + (now.getDate() > 9 ? now.getDate() : '0' + now.getDate());
    var words = document.querySelectorAll('.word-' + word + '-date-' + nowString);
    if (words.length > 0) {
        wordSaved = true;
    } else {
        wordSaved = false;
    }
    
    saveOrRemoveButton();
}

function enableOrDisableSearchButton() {
    var searchButton = document.getElementById('searchButton');
    var resetSearchButton = document.getElementById('resetSearch');
    if (inputSearch.value.length > 0) {
        searchButton.disabled = false;
        resetSearchButton.style.opacity = 1;
    } else {
        searchButton.disabled = true;
        resetSearchButton.style.opacity = 0;
        
    }
}

// Return URL of a RAE search
function getSearchURL(word) {
    // escape is used because RAE uses ISO-8859-1 encoding instead UTF-8
    if (word.length > 0) {
        //return "http://lema.rae.es/drae/srv/search?val=" + escape(word) + '&origen=APP&type=' + searchType;
		//return "http://dle.rae.es/srv/search?w=" + escape(word) + "&m=form";
		//return "http://es.thefreedictionary.com/" + escape(word);
		return "https://od-api.oxforddictionaries.com:443/api/v1/entries/es/" + word + "/definitions";
    } else {
        return '';
    }
}

function searchDefinition() {
        var search = document.getElementById('inputSearch').value;
		var reqSearch = new XMLHttpRequest();
        reqSearch.open('GET', getSearchURL(search), true);
        //reqSearch.setRequestHeader('Content-Type', 'application/json');
		reqSearch.setRequestHeader('Accept', 'application/json');
		reqSearch.setRequestHeader('app_id', '07ac571b');
		reqSearch.setRequestHeader('app_key', '308c3137db8439c888a729cda81b6d02');
        //reqSearch.responseType = 'application/json';
        reqSearch.onreadystatechange = function (aEvt) {
            if (reqSearch.readyState === 4) {
                if (reqSearch.status === 200 || (reqSearch.status === 0 && reqSearch.responseText)) {
                    // Event is removed because response is already set
                    reqSearch.onreadystatechange = null;

                    // Each line contains a word, and they are saved as array 
                    console.log(reqSearch.responseText);
                } else {
                    dump("Error loading page\n");
                }
            }
        };
        reqSearch.send();
		//iFrame.setAttribute('src', getSearchURL(search));
        // Search is stored in array
        searches.push(search);
        indexSearches++;
		var backButton = document.getElementById('iframeBack');
        backButton.disabled = false;
        
        // Add word to history
        wordSaved = false;
        if (autosaveHistory) {
            addWordToHistory(search);
        } else {
            updateWordSaved();
        }
    }

function changeDrawerClass(className) {
    document.getElementById('drawer').className = className;
}

function back() {
    history.go(-1);
    // false is returned to don't go to the link
    return false;
}

