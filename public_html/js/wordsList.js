// Arrays of words lists
var allWords = [];
var searchedWords = [];
var wordsCharged = false;

// Dynamic localize
var searchResults = '';
var clear = '';
navigator.mozL10n.ready ( function () {
    var _ = navigator.mozL10n.get;
    searchResults = _('searchResults');
    clear = _('clear');
});

document.addEventListener('DOMContentLoaded', function() {
    // Enable/disable search button
    var beginSearch = document.getElementById('beginSearch');
    var containSearch = document.getElementById('containSearch');
    var endSearch = document.getElementById('endSearch');
    beginSearch.onkeyup = enableOrDisableSearchWordsListButton;
    beginSearch.oninput = enableOrDisableSearchWordsListButton;
    containSearch.onkeyup = enableOrDisableSearchWordsListButton;
    containSearch.oninput = enableOrDisableSearchWordsListButton;
    endSearch.onkeyup = enableOrDisableSearchWordsListButton;
    endSearch.oninput = enableOrDisableSearchWordsListButton;
    
    // Search
    document.getElementById('searchInWordsListButton').onclick = searchInWordsList;
    
    // Charge words list
    document.getElementById('tab3').onclick = function () {
        changeDrawerClass('mainDrawer');
        
        // Words list is charged if not has been charged yet
        if (!wordsCharged) {
            wordsCharged = true;
            // Get list of all listapalabras.com words
            var reqWordsList = new XMLHttpRequest();
            reqWordsList.open('GET', './resources/words_UTF8.txt', true);
            reqWordsList.setRequestHeader('Content-Type', 'text/plain');
            reqWordsList.responseType = 'text';
            reqWordsList.onreadystatechange = function(aEvt) {
                if (reqWordsList.readyState === 4) {
                    if (reqWordsList.status === 200 || (reqWordsList.status === 0 && reqWordsList.responseText)) {
                        // Event is removed because response is already set
                        reqWordsList.onreadystatechange = null;

                        // Each line contains a word, and they are saved as array 
                        allWords = reqWordsList.responseText.split('\n');
                        // Put content in words list section but not visible because performance
                        var wordsList = '';
                        var currentLetter = '0';
                        var word = '';
                        for (var i = 0; i < allWords.length; i++) {
                            word = allWords[i];
                            // If the initial letter has changed put header and ul
                            if (!sameLetter(word.charAt(0), currentLetter)) {
                                // If not is first letter before letter is closed
                                if (wordsList) {
                                    wordsList += '</li></ul>';
                                }

                                currentLetter = word.charAt(0);
                                wordsList += '<header ><a id="hLet' + currentLetter.toUpperCase()
                                        + '" href="#letA" onclick="return focusLetter(\''
                                        + currentLetter.toUpperCase() + '\');">'
                                        + currentLetter.toUpperCase() + '</a></header>';
                                wordsList += '<ul class="letterHidden" id="let' + currentLetter.toUpperCase() + '"><li>';
                            }

                            wordsList += '<a href="#panel1" onclick="searchInRae(\'' + word + '\');">' + word + '</a>';
                        }
                        document.getElementById('wordsList').innerHTML = wordsList;
                        
                        // A letter is selected
                        document.getElementById('hLetA').click();
                    } else {
                        dump("Error loading page\n");
                    }
                }
            };
            reqWordsList.send();
        }
    };
});

// Compare two letters in downcase and without tildes
function sameLetter(first, second) {
    first = first.toLowerCase();
    second = second.toLowerCase();
    
    // Tildes are removed
    first = first.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u');
    second = second.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u');
    
    return first === second;
}

// Go to letter link and return to panel3 link to avoid loosing tab3 selection.
// In addition the shown letter is hidden and the new letter is shown
function focusLetter(letter) {
    document.getElementById('searchedPanel').className = 'hidden';
    
    var old = document.querySelector('.letterShown');
    if (old) {
        old.className = 'letterHidden';
    }
    document.getElementById('let' + letter).className = 'letterShown';
    
    window.location = window.location.pathname + '#let' + letter;
    window.location.href = window.location.pathname + '#panel3';
    return false;
}

// Put word in search field and fire click event in search button
function searchInRae(word) {
    document.getElementById('inputSearch').value = word;
    document.getElementById('searchButton').disabled = false;
    document.getElementById('searchButton').click();
}

function enableOrDisableSearchWordsListButton() {
    var beginSearch = document.getElementById('beginSearch');
    var containSearch = document.getElementById('containSearch');
    var endSearch = document.getElementById('endSearch');
    var searchButton = document.getElementById('searchInWordsListButton');
    if (searchButton.disabled && (beginSearch.value.length > 0
            || containSearch.value.length > 0 || endSearch.value.length > 0)) {
        searchButton.disabled = false;
    }
    if (!searchButton.disabled && (beginSearch.value.length === 0
            && containSearch.value.length === 0 && endSearch.value.length === 0)) {
        searchButton.disabled = true;
    }
}

function showOrHideSearchBars() {
    var form = document.getElementById('searchInWordsListForm');
    if (form.className === 'formHidden') {
        form.className = 'formSearchInWordsList';
    } else {
        form.className = 'formHidden';
    }
    enableOrDisableSearchWordsListButton();
    
    // Not go to link
    return false;
}

// Go to A letter (cleaning search) and hide search form
function clearSearchInWordsList() {
    // Clean search
    searchedWords = [];
    document.getElementById('searchedPanel').className = 'hidden';
    document.getElementById('searchedPanel').innerHTML = '';
    document.getElementById('wordsList').className = '';
    document.getElementById('scrollWordsList').className = '';
    document.getElementById('searchInWordsListForm').className = 'hidden';
    focusLetter('A');
}

function searchInWordsList() {
    var beginSearch = document.getElementById('beginSearch');
    var containSearch = document.getElementById('containSearch');
    var endSearch = document.getElementById('endSearch');
    
    var begin = beginSearch.value;
    var searchInBegin = begin.length > 0;
    var contain = containSearch.value.split(' ');
    var searchInContain = contain.length > 0;
    var end = endSearch.value;
    var searchInEnd = end.length > 0;
    
    // words are searched in allWords array and inserted in searchedWords array
    searchedWords = [];
    for (var i = 0; i < allWords.length; i++) {
        var word = allWords[i];
        if ((!searchInBegin || word.startsWith(begin))
                && (!searchInContain || exactlyContains(contain, word))
                && (!searchInEnd || word.endsWith(end))) {
            searchedWords.push(word);
        }
    }
    
    // Format words
    var wordsList = '<h1 data-l10n-id="searchResults">' + searchResults + '</h1>';
    for (var i = 0; i < searchedWords.length; i++) {
        word = searchedWords[i];
        
        wordsList += '<a href="#panel1" onclick="searchInRae(\'' + word + '\');">' + word + '</a><br/>';
    }
    wordsList += '<br/><button class="danger" role="button" type="reset" data-l10n-id="clear" onclick="clearSearchInWordsList();">' + clear + '</button>';

    // Charge values in panel and show it
    var panel = document.getElementById('searchedPanel');
    panel.innerHTML = wordsList;
    panel.className = 'searchedPanel';
    
    // Hide form and wordsList panel
    document.getElementById('wordsList').className = 'hidden';
    document.getElementById('scrollWordsList').className = 'hidden';
    showOrHideSearchBars();
}

// Search if word contains array words in same order
function exactlyContains(array, word) {
    var indexes = [];
    for (var i = 0; i < array.length; i++) {
        var index = word.indexOf(array[i]);
        if (index > -1) {
            indexes.push(index);
        } else {
            return false;
        }
    }
    var previous = indexes[0];
    for (var i = 1; i < indexes.length; i++) {
        if (indexes[i] < previous) {
            return false;
        }
    }
    
    return true;
}