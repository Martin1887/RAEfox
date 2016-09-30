onmessage = function(e) {
	var allWords = e.data.allWords;
	
	var begin = e.data.begin;
	var contain = e.data.contain;
	var end = e.data.end;
	
	var searchInBegin = begin.length > 0;
    if (searchInBegin) {
        begin = begin.toLowerCase();
    }
	var searchInContain = contain.length > 0 && contain[0].length > 0;
	if (searchInContain) {
		contain.forEach(function(word, index) {
			contain[index] = word.toLowerCase();
		});
	}
	var searchInEnd = end.length > 0;
    if (searchInEnd) {
        end = end.toLowerCase();
    }
	
	var wordsList = '';
	var count = 0;
	// words are searched in allWords array
    allWords.forEach(function(word) {
		word = word.toLowerCase();
		if ((!searchInBegin || word.startsWith(begin))
                && (!searchInContain || exactlyContains(contain, word))
                && (!searchInEnd || word.endsWith(end))) {
            wordsList += '<a href="#panel1" onclick="searchInRae(\'' + word + '\');">' + word + '</a><br/>';
			count++;
			
			// send words with few results
			if (count < 100 && count % 5 === 0) {
				postMessage({wordsList: wordsList, count: count, end: false});
				wordsList = '';
			}
        }
	});
	
	postMessage({wordsList: wordsList, count: count, end: true});
},
// Search if word contains array words in same order
exactlyContains = function(array, word) {
	var indexes = [];
    var lower = word.toLowerCase();
    for (var i = 0; i < array.length; i++) {
        var index = lower.indexOf(array[i].toLowerCase());
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