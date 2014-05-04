// Array in which navigation history is saved
var searches = [];
searches.push('');
var indexSearches = 0;

var searchType = 3;

document.addEventListener('DOMContentLoaded', function() {
    // Change searchType on select selection
    document.getElementById('typeSelect').onchange = changeSearchType;
    
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
    form.onsubmit = function() {
        var search = document.getElementById('inputSearch').value;
        iFrame.setAttribute('src', getURLRAE(search));
        // Search is stored in array
        searches.push(search);
        indexSearches++;
        backButton.disabled = false;
    };

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
    
});

function changeSearchType() {
    var newValue = document.getElementById('typeSelect').value;
    searchType = newValue;
}

function enableOrDisableSearchButton() {
    var searchButton = document.getElementById('searchButton');
    if (inputSearch.value.length > 0) {
        searchButton.disabled = false;
    } else {
        searchButton.disabled = true;
    }
}

// Return URL of a RAE search
function getURLRAE(word) {
    // escape is used because RAE uses ISO-8859-1 encoding instead UTF-8
    if (word.length > 0) {
        return "http://lema.rae.es/drae/srv/search?val=" + escape(word) + '&origen=APP&type=' + searchType;
    } else {
        return '';
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

