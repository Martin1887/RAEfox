onmessage = function(e) {
    var wordsList = '';
	var toRemove = '';
	var inverse = e.data.inverse;
	var offset = e.data.offset;
	var pageSize = e.data.pageSize;
	var wordsByLetter = e.data.wordsByLetter;
    var writtenWords = 0;
    var allWords = e.data.allWords;
    var letter = e.data.letter;

	var letterStart = 0;
	var letterOrder = 0;
	// Letter 'Ñ' is bigger in ASCII
	if (letter === 'Ñ') {
		letterOrder = 'N'.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
	} else if (letter < 'N') {
		letterOrder = letter.charCodeAt(0) - 'A'.charCodeAt(0);
	} else {
		letterOrder = letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
	}
	
	if ((inverse && offset > 0) || (!inverse && offset < wordsByLetter[letterOrder])) {
		for (var i = 0; i < letterOrder; i++) {
			letterStart += wordsByLetter[i];
		}
		
		// Only remove content if there are more than 2 pages
		if (inverse && offset >= pageSize) {
			var iniRemove = offset + pageSize;
			for (var i = letterStart + iniRemove; i < letterStart + offset + (2 * pageSize) && i < letterStart + wordsByLetter[letterOrder]; i++) {
				var word = allWords[i];
				toRemove += '<a href="#panel1" onclick="searchInRae(\'' + word + '\');">' + word + '</a>';
			}
		} else if (!inverse && offset >= 2 * pageSize) {
			var iniRemove = offset - (2 * pageSize);
			if (iniRemove < 0) {
				iniRemove = 0;
			}
			for (var i = letterStart + iniRemove; i < letterStart + offset - pageSize; i++) {
				var word = allWords[i];
				toRemove += '<a href="#panel1" onclick="searchInRae(\'' + word + '\');">' + word + '</a>';
			}
		}

		if (inverse) {
			for (var i = letterStart + offset - 1; i >= letterStart + offset - pageSize && i >= 0; i--) {
				var word = allWords[i];
				wordsList = '<a href="#panel1" onclick="searchInRae(\'' + word + '\');">' + word + '</a>' + wordsList;
				writtenWords++;
			}
		} else {
			for (var i = letterStart + offset; i < letterStart + offset + pageSize && i < letterStart + wordsByLetter[letterOrder]; i++) {
				var word = allWords[i];
				wordsList += '<a href="#panel1" onclick="searchInRae(\'' + word + '\');">' + word + '</a>';
				writtenWords++;
			}
		}

		if (inverse) {
			offset -= writtenWords;
		} else {
			offset += writtenWords;
		}
				
		postMessage({wordsList: wordsList, toRemove: toRemove, offset: offset, inverse: inverse, written: writtenWords});
	} else {
		postMessage({written: 0});
	}
}

