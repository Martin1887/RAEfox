// Array in which navigation history is saved
var searches = [];
searches.push('');
var indexSearches = 0;

var autosaveHistory = false;
var wordSaved = false;

// the worker is global in order to only one execution at a time of search suggestions
var suggestionsWorker = null;

var defHeaderMoreResults = '';
var defBodyMoreResults = '';
var defHeaderNoResults = '';
var defBodyNoResults = '';

var allDefs = {};

var prevWindowWidth = 0;


var callbackThemesClose;

if (navigator.mozL10n) {
	navigator.mozL10n.ready(function() {
		// grab l10n object
		var _ = navigator.mozL10n.get;
		
		defHeaderMoreResults = _('defHeaderMoreResults');
		defBodyMoreResults = _('defBodyMoreResults');
		defHeaderNoResults = _('defHeaderNoResults');
		defBodyNoResults = _('defBodyNoResults');
	});
}


window.addEventListener('resize', function(e) {
	if (e.currentTarget.innerWidth >= 900) {
		chargeHistory();
		chargeWordsList();
	} else if (prevWindowWidth >= 900) {
		// change tab only if the three tabs were visible
		document.getElementById('tab1').click();
	}
	
	prevWindowWidth = e.currentTarget.innerWidth;
});

document.addEventListener('DOMContentLoaded', function() {
    prevWindowWidth = window.innerWidth;
	
	searchTyping();
    
    // Autosave history on/off
    document.getElementById('autosaveInput').onchange = changeAutosave;
    
    
    // Enable/disable search button
    var inputSearch = document.getElementById('inputSearch');
	var suggestions = document.getElementById('suggestions');
	inputSearch.onkeyup = navigateSuggestions;
    inputSearch.oninput = searchTyping;
	inputSearch.onfocus = function() {
		suggestions.className = suggestions.className.replace(/ hidden/g, '');
	};
	inputSearch.onblur = function() {
		setTimeout(function() {
			suggestions.className += ' hidden';
		}, 200);
	};

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
			insertHTMLDefinition(searchInput.value);
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
			insertHTMLDefinition(searchInput.value);
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
	
	setTimeout(function() {
		readCSV('./resources/definitions.csv', allDefs);
	}, 500);
});

function clearInput(input) {
    input.value = '';
    searchTyping();
}

function changeTab(tab) {
    if (tab === 1) {
		if (window.innerWidth < 900) {
			document.getElementById('menuEdit').className = 'hidden';
		}
    } else if (tab === 2) {
        document.getElementById('menuEdit').className = '';
    } else if (tab === 3) {
        if (window.innerWidth < 900) {
			document.getElementById('menuEdit').className = 'hidden';
		}
    }
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

function navigateSuggestions(event) {
	var key = event.key;
	var suggestionsUl = document.getElementById('suggestions');
	var cursorIn = suggestionsUl.querySelector('.cursorIn');
	
	switch (key) {
		case 'ArrowDown':
			if (cursorIn) {
				if (cursorIn.nextSibling) {
					cursorIn.className = '';
					cursorIn.nextSibling.className = 'cursorIn';
				}
			} else {
				suggestionsUl.firstChild.className = 'cursorIn';
			}
			cursorIn = suggestionsUl.querySelector('.cursorIn');
			if (cursorIn) {
				// keep selection in center of scrolling
				var center = cursorIn.offsetTop - (suggestionsUl.clientHeight / 2);
				suggestionsUl.scrollTop = center > 0 ? center : 0;
			}
			break;
		case 'ArrowUp':
			if (cursorIn) {
				cursorIn.className = '';
				if (cursorIn.previousSibling) {
					cursorIn.previousSibling.className = 'cursorIn';
				}
			}
			cursorIn = suggestionsUl.querySelector('.cursorIn');
			if (cursorIn) {
				// keep selection in center of scrolling
				var center = cursorIn.offsetTop - (suggestionsUl.clientHeight / 2);
				suggestionsUl.scrollTop = center > 0 ? center : 0;
			}
			break;
			
		case 'ArrowRight':
			if (cursorIn) {
				document.getElementById('inputSearch').value = cursorIn.textContent;
			}
			break;
		case 'Enter':
			if (cursorIn) {
				document.getElementById('inputSearch').value = cursorIn.textContent;
			}
			break;
		default:
			searchTyping();
			break;
	}
}

function searchTyping() {
    var searchButton = document.getElementById('searchButton');
    var resetSearchButton = document.getElementById('resetSearch');
	var inputSearch = document.getElementById('inputSearch');
    if (inputSearch.value.length > 0) {
        searchButton.disabled = false;
        resetSearchButton.style.opacity = 1;
    } else {
        searchButton.disabled = true;
        resetSearchButton.style.opacity = 0;
    }
	
	if (!allWords || allWords.length === 0) {
        loadAllWords(searchSuggestions, [inputSearch.value]);
    } else {
        searchSuggestions(inputSearch.value);
    }
}

function searchSuggestions(search) {
	var suggestionsUl = document.getElementById('suggestions');
	if (search && search.length > 0) {
		search = search.toLowerCase();
		
		if (suggestionsWorker) {
			suggestionsWorker.terminate();
		}
		suggestionsWorker = new Worker('js/workerBinarySearch.js');
		suggestionsWorker.onmessage = function(e) {
			var matches = e.data.matches;

			var lisHtml = '';
			matches.forEach(function(match) {
				lisHtml += '<li onclick="searchInRae(\'' + match + '\');">' + match + '</li>';
			});
			suggestionsUl.innerHTML = lisHtml;

			if (matches.length > 0) {
				// add animation if it had not elements
				if (suggestionsUl.className.indexOf('suggestionsUlShown') < 0) {
					suggestionsUl.className += ' suggestionsUlShown';
				}
			} else {
				// remove animation class
				suggestionsUl.className = suggestionsUl.className.replace(/suggestionsUlShown/g, '');
			}
		};
		suggestionsWorker.postMessage({allWords: allWords, word: search});
	} else {
		suggestionsUl.innerHTML = '';
		suggestionsUl.className = suggestionsUl.className.replace(/suggestionsUlShown/g, '');
	}
}

function searchDefinition() {
	var search = document.getElementById('inputSearch').value;
	
	insertHTMLDefinition(search);
	
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


function insertHTMLDefinition(search) {
	if (!search) {
		document.getElementById('definitions').innerHTML = '';
		return;
	}
	
	search = search.toLowerCase();
	var defs = allDefs[search];
	
	var html = '<h1>' + search + '</h1><section class="definitions" data-type="list">';
	
	if (!defs) {
		html += '<header data-l10n-id="defHeaderNoResults">' + defHeaderNoResults + '</header>';
		html += '<p><span data-l10n-id="defBodyNoResults">' + defBodyNoResults
			+ '</span><a target="_blank" href="http://rae.es">rae.es</a>.</p></section>';
		document.getElementById('definitions').innerHTML = html;
		return;
	}
	
	
	defs.forEach(function(def, ind) {
		html += '<header>' + (ind + 1) + '.</header>';
		html += '<p>';
		// split by all whitespace, quotation marks and punctuation characters
		var split = def.split(/[\s]/);
		split.forEach(function(word) {
			html += '<span class="definitionWord" onclick="searchInRae(\'';
			
			// remove punctuation characters in onclick
			html += word.replace(/[\s,;.:_ \'\"\(\)\[\]\{\}¿?¡!/0-9%\u00AB\u2039\u00BB\u203A]/gi, '').toLowerCase() + '\')"';
			
			html += '>' + word + '&nbsp;</span>';
		});
		html += '</p>';
	});
	
	html += '<header data-l10n-id="defHeaderMoreResults">' + defHeaderMoreResults + '</header>';
	html += '<p><span data-l10n-id="defBodyMoreResults">' + defBodyMoreResults
			+ '</span><a target="_blank" href="http://rae.es">rae.es</a>.</p>';
	
	html += '</section>';
	document.getElementById('definitions').innerHTML = html;
}

/**
 * 
 * @param {string} path The path to the CSV to read
 * @param {object} dest The object in which write the results
 * @param {boolean} hasHeader true if CSV has header, by default true
 * @param {string} delimiter The delimiter string, by default ','
 * @param {string} enclosing The character enclosing each column, by default '"'
 * @param {int} key_idx The key column index begining by 0, by default 0
 * @param {int} value_idx The value column index begining by 0, by default 1
 */
function readCSV(path, dest, hasHeader, delimiter, enclosing, key_idx, value_idx) {
	if (hasHeader === null || hasHeader === undefined) {
		hasHeader = true;
	}
	if (!delimiter) {
		delimiter = ',';
	}
	if (!enclosing) {
		enclosing = '"';
	}
	if (!key_idx) {
		key_idx = 0;
	}
	if (!value_idx) {
		value_idx = 1;
	}
	
	var reqDefs = new XMLHttpRequest();
	reqDefs.open('GET', path, true);
	reqDefs.setRequestHeader('Content-Type', 'text/plain');
	reqDefs.responseType = 'text';
	reqDefs.onreadystatechange = function (aEvt) {
		if (reqDefs.readyState === 4) {
			if (reqDefs.status === 200 || (reqDefs.status === 0 && reqDefs.responseText)) {
				// Event is removed because response is already set
				reqDefs.onreadystatechange = null;

				// Each line contains a word, and they are saved as array 
				var allDefs = reqDefs.responseText.split('\n');
				
				var firstLine = true;
				
				allDefs.forEach(function(line) {
					if (!firstLine || !hasHeader) {
						var split = line.split(enclosing + delimiter + enclosing);
						var key = split[key_idx];
						var value = split[value_idx];
						
						if (value) {
							// remove enclosing character
							if (key.charAt(0) === enclosing) {
								key = key.substring(1);
							} else if (key.charAt(key.length - 1) === enclosing && key.charAt(key.length - 2) !== '\\') {
								key = key.substring(0, key.length - 1);
							}
							if (value.charAt(0) === enclosing) {
								value = value.substring(1);
							} else if (value.charAt(value.length - 1) === enclosing && value.charAt(value.length - 2) !== '\\') {
								value = value.substring(0, value.length - 1);
							}


							if (dest[key] && Array.isArray(dest[key])) {
								var defs = dest[key];
								defs.push(value);
								dest[key] = defs;
							} else {
								dest[key] = [value];
							}
						}
					}
					
					if (firstLine) {
						firstLine = false;
					}
				});
			} else {
				dump("Error loading page\n");
			}
		}
	};
	reqDefs.send();
}


function back() {
    history.go(-1);
    // false is returned to don't go to the link
    return false;
}

