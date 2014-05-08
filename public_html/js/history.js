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
                    allHistoryWords.push(cursor.value);
                    cursor.continue();
                }
            };
                    
            var historyList = '';
            var currentDate = '';
            var word = '';

            for (var i = 0; i < allHistoryWords.length; i++) {
                word = allHistoryWords[i].word;
                // If the initial letter has changed put header and ul
                if (allHistoryWords[i].date !== currentDate) {
                    // If not is first letter before letter is closed
                    if (historyList) {
                        historyList += '</li></ul>';
                    }

                    currentDate = allHistoryWords[i].date;
                    // TODO: localize dates
                    historyList += '<header>' + allHistoryWords[i].date + '</header>';
                    historyList += '<ul id="historyDate' + allHistoryWords[i].date + '"><li>';
                }

                historyList += '<a href="#panel1" onclick="searchInRae(\'' + word + '\');">' + word + '</a>';
            }
            document.getElementById('historyList').innerHTML = historyList;
        }
    };
});


// Add searched word to database and history list
function addWordToHistory(word) {
    var objectStore = db.transaction(['history'], 'readwrite').objectStore('history');
    var now = new Date();
    // Format d/m/YYYY, getMonth returns 0-11
    var nowString = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear();
    var insertRequest = objectStore.add({word: word, date: nowString});
    
    insertRequest.onsuccess = function() {
        // Add word to historyList (adding new date if it is today first search or adding to today list)
        // TODO: localize dates
        var todayList = document.getElementById('historyDate' + nowString);
        var link = '<a href="#panel1" onclick="searchInRae(\'' + word + '\');">' + word + '</a>';
        if (todayList) {
            var liParent = todayList.firstChild;
            var firstAChild = liParent.firstChild;
            liParent.innerHTML = link + liParent.innerHTML;
        } else {
            var historyList = document.getElementById('historyList');
            var firstHeaderChild = historyList.firstChild;
            var newList = '<header>' + nowString + '</header><ul id="historyDate' + nowString + '"><li>'
                    + link + '</li></ul>';
            historyList.innerHTML = newList + historyList.innerHTML;
        }
    };
}