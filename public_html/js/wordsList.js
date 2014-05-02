// Arrays of words lists
var allWords = [];
var searchedWords = [];
var wordsCharged = false;

document.addEventListener('DOMContentLoaded', function() {
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
                        // Put content in words list section
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
                                wordsList += '<header>' + currentLetter.toUpperCase() + '</header>';
                                wordsList += '<ul id="let' + currentLetter.toUpperCase() + '"><li>';
                            }

                            wordsList += '<a href="#panel1" onclick="searchInRae(\'' + word + '\');">' + word + '</a>';
                        }
                        document.getElementById('wordsList').innerHTML = wordsList;
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

// Go to letter link and return to panel3 link to avoid loosing tab3 selection
function focusLetter(letter) {
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