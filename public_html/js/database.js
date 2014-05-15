var db;
var openRequest = indexedDB.open('RAEfox', 5);

openRequest.onsuccess = function(event) {
    db = openRequest.result;
    
    // Set value of searchType variable and change value of searchType select
    db.transaction(['searchType']).objectStore('searchType').get('searchType').onsuccess = function(event) {
        searchType = event.target.result.type;
        document.getElementById('typeSelect').value = searchType;
    };
    
    // Set value of autosaveHistory variable and change value of switch
    db.transaction(['autosaveHistory']).objectStore('autosaveHistory').get('autosave').onsuccess = function(event) {
        autosaveHistory = event.target.result.type;
        document.getElementById('autosaveInput').checked = autosaveHistory;
        changeAutosave();
    };
    
};

// Creation of database
openRequest.onupgradeneeded = function(event) {
    db = event.target.result;
    
    if (db.version === 1) {
        // searchType: a field whose value is always 'searchType' is used to access
        var searchTypeStore = db.createObjectStore("searchType", {keyPath: 'varName'});
        // Default searchType is 3
        searchTypeStore.add({varName: 'searchType', type: 3});

        // history: autoincrement with date index and word
        var historyStore = db.createObjectStore('history', {autoIncrement: true});
        historyStore.createIndex('date', 'date', {unique: false});
    } else if (db.version === 5) {
        // autosave history: a field whose value is always 'autoSave' is used to access
        var autosaveHistoryStore = db.createObjectStore('autosaveHistory', {keyPath: 'varName'});
        autosaveHistoryStore.add({varName: 'autosave', val: false});
    }
};