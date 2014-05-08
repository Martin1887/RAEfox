var db;
var openRequest = indexedDB.open('RAEfox', 1);

openRequest.onsuccess = function(event) {
    db = openRequest.result;
    
    // Set value of searchType variable and change value of searchType select
    db.transaction(['searchType']).objectStore('searchType').get('searchType').onsuccess = function(event) {
        searchType = event.target.result.type;
        document.getElementById('typeSelect').value = searchType;
    };
    
};

// Creation of database
openRequest.onupgradeneeded = function(event) {
    db = event.target.result;
    
    // searchType: a field whose value is always 'searchType' is used to access
    var searchTypeStore = db.createObjectStore("searchType", {keyPath: 'varName'});
    // Default searchType is 3
    searchTypeStore.add({varName: 'searchType', type: 3});
    
    // history: autoincrement with date index and word
    var historyStore = db.createObjectStore('history', {autoIncrement: true});
    historyStore.createIndex('date', 'date', {unique: false});
};