var historyCharged = false;

document.addEventListener('DOMContentLoaded', function() {
    // Charge history
    document.getElementById('tab2').onclick = function () {
        changeDrawerClass('mainDrawer');
        
       
        // History is charged if not has been charged yet
        if (!historyCharged) {
            historyCharged = true;
            var allHistoryWords = [];
            
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
                        // If not is first letter before letter is closed
                        if (historyList) {
                            historyList += '</li></ul>';
                        }

                        currentDate = allHistoryWords[i].value.date;
                        var f = new navigator.mozL10n.DateTimeFormat();
                        // With more than 3 days return formatted date and difference is forced to days
                        var date = f.fromNow(new Date(allHistoryWords[i].value.date), false, 86400 * 3, 'days');
                        historyList += '<header>' + date + '</header>';
                        historyList += '<ul id="historyDate' + date + '"><li>';
                    }

                    // Class is used to search to remove from search tab button
                    historyList += '<a id="' + allHistoryWords[i].key + '" class="word-' + word + '-date-' + allHistoryWords[i].value.date +'" href="#panel1" onclick="searchInRae(\'' + word + '\');">' + word + '</a>';
                }
                document.getElementById('historyList').innerHTML = historyList;
                };
            
        }
    };
});


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
        var link = '<a id="' + key + '" class="word-' + word + '-date-' + nowString +'" href="#panel1" onclick="searchInRae(\'' + word + '\');">' + word + '</a>';
        if (todayList) {
            var liParent = todayList.firstChild;
            liParent.innerHTML = link + liParent.innerHTML;
        } else {
            var historyList = document.getElementById('historyList');
            // With more than 3 days return formatted date and difference is forced to days
            var newList = '<header>' + f.fromNow(nowDate, false, 86400 * 3, 'days') + '</header><ul id="historyDate' + f.fromNow(nowDate, false, 86400 * 3, 'days') + '"><li>'
                    + link + '</li></ul>';
            historyList.innerHTML = newList + historyList.innerHTML;
        }
    };
    wordSaved = true;
    saveOrRemoveButton();
}

// Remove searched word form history
function removeWordFromHistory(word) {
    var now = new Date();
    // Format YYYY-MM-dd (automatically Date objects creation), getMonth returns 0-11
    var nowString = now.getFullYear() + '-' + (now.getMonth() + 1 > 9 ? (now.getMonth() + 1) : '0' + (now.getMonth() + 1))
            + '-' + (now.getDate() > 9 ? now.getDate() : '0' + now.getDate());
    // Words of today are searched in order to delete them
    var idsToDestroy = [];
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
    
    // Word is removed from today list
    var elements = document.querySelectorAll('.word-' + word + '-date-' + nowString);
    for (var i = 0; i < elements.length; i++) {
        elements[i].parentNode.removeChild(elements[i]);
    }
    wordSaved = false;
    saveOrRemoveButton();
}