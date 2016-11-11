onmessage = function(e) {

	var allWords = e.data.allWords;
	
	var search = e.data.word.toLowerCase();
	var prefix = cleanTildes(search);
	var prefixLength = prefix.length;
	
	var matches = [];
	
	// words are searched in allWords array using binary search
	var left = 0;
	var right = allWords.length - 1;
	var index = left + parseInt((right - left) / 2);
		
	var success = false;
	
	while (!success && left < right) {
		var word = cleanTildes(allWords[index]).substr(0, prefixLength);
				
		if (word === prefix) {
			success = true;
		} else {
			var compare = prefix.localeCompare(word);
			if (compare < 0) {
				// prefix is before
				right = index - 1;
				index = left + parseInt((right - left) / 2);
			} else {
				// prefix is after
				left = index + 1;
				index = left + parseInt((right - left) / 2);
			}
		}
	}
	
	// index is inside the interval of matches, search left and right boundaries of interval
	var left = index;
	var right = index;
		
	while (cleanTildes(allWords[left]).substr(0, prefixLength) === prefix && left >= 0) {
		left--;
	}
	left++;
	while (cleanTildes(allWords[right]).substr(0, prefixLength) === prefix && right < allWords.length) {
		right++;
	}
	right--;
	
	// matches are between left and right boundaries, but not all these words matches because the cleaning
	// send a max of 50 words for better performance (nobody scroll more than 50 words in a suggestions list)
	var added = 0;
	for (var i = left; i <= right && added <= 50; i++) {
		if (allWords[i].substr(0, prefixLength) === search) {
			matches.push(allWords[i]);
			added++;
		}
	}
	
	postMessage({matches: matches});
},
// Clean tildes and other puntuaction signs for comparing words
cleanTildes = function(word) {
	var replace = [['á', 'a'], ['é', 'e'], ['í', 'i'], ['ó', 'o'], ['ú', 'u'], ['ü', 'u'], [' ', ''], ['-', '']];
	
	if (word) {
		replace.forEach(function(pair) {
			word = word.replace(new RegExp(pair[0], 'gi'), pair[1]);
		});
	}
    
    return word;
}