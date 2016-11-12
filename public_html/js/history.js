var historyCharged = false;
var editMode = false;

document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth >= 900) {
		chargeHistory();
	}
	
	// Charge history
    document.getElementById('tab2').onclick = function () {
        changeTab(2);
        
        chargeHistory();
        
    };
});

function chargeHistory() {
	document.getElementById('menuEdit').className = '';
	
	// History is charged if not has been charged yet
    if (!historyCharged) {
		historyCharged = true;
		var allHistoryWords = [];

		// wait until db is loaded
		var inter = setInterval(function() {
			if (db) {
				clearInterval(inter);
				
				var objectStore = db.transaction(['history']).objectStore('history');
				// All objects are iterated from last to first
				objectStore.openCursor(null, 'prev').onsuccess = function(event) {
					var cursor = event.target.result;
					if (cursor) {
						allHistoryWords.push({key: cursor.key, value: cursor.value});
						cursor.continue();
					}

					var historyList = '';
					var currentDate = '';
					var word = '';

					for (var i = 0; i < allHistoryWords.length; i++) {
						word = allHistoryWords[i].value.word;
						// If the initial letter has changed put header and ul
						if (allHistoryWords[i].value.date !== currentDate) {
							// If it is not the first letter, before letter is closed
							if (historyList) {
								historyList += '</li></ul>';
							}

							currentDate = allHistoryWords[i].value.date;
							var f = new navigator.mozL10n.DateTimeFormat();
							// With more than 3 days return formatted date, and difference is forced to days
							var date = f.fromNow(new Date(allHistoryWords[i].value.date), false, 86400 * 3, 'days');
							historyList += '<header>' + date + '</header>';
							historyList += '<ul class="ulHistory" id="historyDate' + date + '"><li>';
						}

						// Class is used to search to remove from search tab button
						historyList += '<a id="' + allHistoryWords[i].key + '" class="word-' + word + '-date-'
								+ allHistoryWords[i].value.date
								+ '" href="#panel1" onclick="return searchInRaeFromHistory(\'' + word + '\');">'
								+ '<label onclick="checkRemoveButtonsDisabled();"'
								+ 'class="pack-checkbox checkHistory hiddenCheckHistory">'
								+ '<input type="checkbox" name="' + allHistoryWords[i].key
								+ '"><span></span></label>';
						historyList += word + '</a>';
					}
					document.getElementById('historyList').innerHTML = historyList;
					updateHistoryCount();
				};
			}
		}, 100);
	}
	
	return false;
}

function updateHistoryCount() {
	var count = document.querySelectorAll('.checkHistory').length;
	document.getElementById('historyCount').innerHTML = '(' + count + ')';
}


// Add searched word to database and history list
function addWordToHistory(word) {
    var now = new Date();
    // Format YYYY-MM-dd (automatically Date objects creation), getMonth returns 0-11
    var nowString = now.getFullYear() + '-' + (now.getMonth() + 1 > 9 ? (now.getMonth() + 1) : '0' + (now.getMonth() + 1))
            + '-' + (now.getDate() > 9 ? now.getDate() : '0' + now.getDate());
    var insertRequest = db.transaction(['history'], 'readwrite').objectStore('history').add({word: word, date: nowString});
    var nowDate = new Date(nowString);
    var f = new navigator.mozL10n.DateTimeFormat();
    
    insertRequest.onsuccess = function(event) {
        var key = event.target.result;
        
        // Add word to historyList (adding new date if it is today first search or adding to today list)
        // With more than 3 days return formatted date and difference is forced to days
        var todayList = document.getElementById('historyDate' + f.fromNow(nowDate, false, 86400 * 3, 'days'));
        // Class is used to search to remove
        var link = '<a id="' + key + '" class="word-' + word + '-date-' + nowString
                + '" href="#panel1" onclick="return searchInRaeFromHistory(\'' + word + '\');">'
                + '<label onclick="checkRemoveButtonsDisabled();" class="pack-checkbox checkHistory hiddenCheckHistory">'
                + '<input type="checkbox" name="' + key + '"><span></span></label>' + word + '</a>';
        if (todayList) {
            var liParent = todayList.firstChild;
            liParent.innerHTML = link + liParent.innerHTML;
        } else {
            var historyList = document.getElementById('historyList');
            // With more than 3 days return formatted date and difference is forced to days
            var newList = '<header>' + f.fromNow(nowDate, false, 86400 * 3, 'days')
                    + '</header><ul class="ulHistory" id="historyDate'
                    + f.fromNow(nowDate, false, 86400 * 3, 'days')
                    + '"><li>' + link + '</li></ul>';
            historyList.innerHTML = newList + historyList.innerHTML;
        }
        
        checkRemoveButtonsDisabled();
        changeHistoryEditMode(editMode);
		updateHistoryCount();
    };
    wordSaved = true;
    saveOrRemoveButton();
	
	return false;
}

// Remove searched word form history
function removeWordFromHistory(word, id) {
    var now = new Date();
    // Format YYYY-MM-dd (automatically Date objects creation), getMonth returns 0-11
    var nowString = now.getFullYear() + '-' + (now.getMonth() + 1 > 9 ? (now.getMonth() + 1) : '0' + (now.getMonth() + 1))
            + '-' + (now.getDate() > 9 ? now.getDate() : '0' + now.getDate());
    // Words of today are searched in order to delete them
    var idsToDestroy = [];
    var idElement;
    if (!id) {
        db.transaction(['history']).objectStore('history').openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                if (cursor.value.word === word && cursor.value.date === nowString) {
                    idsToDestroy.push(cursor.key);
                }
                cursor.continue();
            } else {
                for (var i = 0; i < idsToDestroy.length; i++) {
                    db.transaction(['history'], 'readwrite').objectStore('history').delete(idsToDestroy[i]);
                }
            }
        };
    } else {
        db.transaction(['history'], 'readwrite').objectStore('history').delete(parseInt(id));
        idElement = document.getElementById(id);
    }
    
    // Word is removed from day list
    var elements = idElement ? [idElement] : document.querySelectorAll('.word-' + word + '-date-' + nowString);
    var parentLi;
    for (var i = 0; i < elements.length; i++) {
        if (i === 0) {
            parentLi = elements[i].parentNode;
        }
        parentLi.removeChild(elements[i]);
    }
    
    // If day is empty it is removed
    if (!parentLi.hasChildNodes()) {
        var parentUl = parentLi.parentNode;
        var parentSection = parentUl.parentNode;
        var header = parentUl.previousSibling;
        parentUl.removeChild(parentLi);
        parentSection.removeChild(parentUl);
        parentSection.removeChild(header);
    }
    
    wordSaved = false;
    saveOrRemoveButton();
    checkRemoveButtonsDisabled();
	updateHistoryCount();
	
	return false;
}


// Change edit mode showing or hiding selection options and remove buttons
function changeHistoryEditMode(newEditMode) {
    editMode = newEditMode;
    var links = document.querySelectorAll('#historyList a');
    var checks = document.querySelectorAll('.checkHistory');
    var editButton = document.getElementById('editHistoryButton');
    var doneButton = document.getElementById('noEditHistoryButton');
    var removeSelected = document.getElementById('removeSelectedFromHistory');
    var removeAll = document.getElementById('removeAllFromHistory');
    if (newEditMode) {
        // Forbid links go to tab1
        for (var i = 0; i < links.length; i++) {
            links[i].href = '#panel2';
        }
        
        // Change button
        editButton.className = 'hidden';
        doneButton.className = '';
        
        // Show remove buttons and check if they must be disabled
        checkRemoveButtonsDisabled();
        removeSelected.className = 'danger';
        removeAll.className = 'danger';
		
		document.getElementById('historyList').className = 'historyListEditMode';
        
        // Show checkboxes
        for (var i = 0; i < checks.length; i++) {
            // Without hiddenCheckHistory
            checks[i].className = 'pack-checkbox danger checkHistory';
        }
    } else {
        // Allow links go to tab1
        for (var i = 0; i < links.length; i++) {
            links[i].href = '#panel1';
        }
        
        // Change button
        doneButton.className = 'hidden';
        editButton.className = '';
        
        // Hide remove buttons
        removeSelected.className = 'danger hidden';
        removeAll.className = 'danger hidden';
        
        // Hide checkboxes
        for (var i = 0; i < checks.length; i++) {
            // With hiddenCheckHistory
            checks[i].className = 'pack-checkbox danger checkHistory hiddenCheckHistory';
        }
		
		document.getElementById('historyList').className = '';
    }
    // false is returned in order to not go to link
    return false;
}

// Disable or enable remove buttons
function checkRemoveButtonsDisabled() {
    var links = document.querySelectorAll('#historyList a');
    var checks = document.querySelectorAll('.checkHistory');
    var removeSelected = document.getElementById('removeSelectedFromHistory');
    var removeAll = document.getElementById('removeAllFromHistory');
    if (links.length === 0) {
        removeAll.disabled = true;
        removeSelected.disabled = true;
    } else {
        removeAll.disabled = false;
        var anyChecked = false;
        for (var i = 0; i < checks.length; i++) {
            if (checks[i].childNodes[0].checked) {
                anyChecked = true;
                break;
            }
        }
        removeSelected.disabled = !anyChecked;
    }
}

// Search word only if editMode is false
function searchInRaeFromHistory(word) {
    if (!editMode) {
        return searchInRae(word);
    } else {
        // return true in order to checkbox is selected
        return true;
    }
}


// Show remove confirms
function confirmRemoveHistorySelected() {
    document.getElementById('removeSelectedConfirm').className = '';
}
function confirmRemoveAllHistoryElements() {
    document.getElementById('removeAllConfirm').className = '';
}

// Remove selected elements
function removeHistorySelected() {
    var elements = document.querySelectorAll('#historyList input');
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].checked) {
            removeWordFromHistory('', elements[i].parentNode.parentNode.id);
        }
    }
    
    document.getElementById('removeSelectedConfirm').className = 'hidden';
}

// Remove all elements
function removeAllHistoryElements() {
    var elements = document.querySelectorAll('#historyList a');
    for (var i = 0; i < elements.length; i++) {
        removeWordFromHistory('', elements[i].id);
    }
    
    document.getElementById('removeAllConfirm').className = 'hidden';
}