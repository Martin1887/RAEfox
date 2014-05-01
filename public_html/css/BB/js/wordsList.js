document.addEventListener('DOMContentLoaded', function() {
    // Get list of all listapalabras.com words
    var reqWordsList = new XMLHttpRequest();
    reqWordsList.open('GET', 'resources/words_UTF8.txt', true);
    reqWordsList.onreadystatechange = function(aEvt) {
        if (reqWordsList.readyState === 4) {
            if (reqWordsList.status === 200) {
                // Each line contains a word, and they are saved as array 
                allWords = reqWordsList.responseText.split('\n');
                // TODO: put content in words list div
            } else {
                dump("Error loading page\n");
            }
        }
    };
    reqWordsList.send();
});