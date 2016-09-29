onmessage = function(e) {
    var wordsList = '';
    var writed = false;
    var currentLetter = '0';
    var writtenWords = 0;
    var allWords = e.data.allWords;
    var letter = e.data.letter;
    allWords.some(function(word) {
        currentLetter = word.charAt(0);
        // If the initial letter is the letter to 
        if (sameLetter(currentLetter, letter)) {
            wordsList += '<a href="#panel1" onclick="searchInRae(\'' + word + '\');">' + word + '</a>';
            writed = true;
			writtenWords++;
        } else if (writed) {
            // return true exits loop, letter is filled
            return true;
        }
        
        // add firstly only 50 words (20 for W because it only has 22)
        if (writtenWords === 20 || writtenWords === 200) {
            postMessage({wordsList: wordsList, end: false});
            wordsList = '';
        }
        
        // return true exits loop
        return false;
    });
    
    postMessage({wordsList: wordsList, end: true});
},
// Compare two letters in downcase and without tildes
sameLetter = function(first, second) {
    first = first.toLowerCase();
    second = second.toLowerCase();
    
    // Tildes are removed
    first = first.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u');
    second = second.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u');
    
    return first === second;
}

