var db;
var databaseOpened = false;

document.addEventListener('DOMContentLoaded', function() {

	var openRequest = indexedDB.open('RAEfox', 1);
	
	var newDatabase = false;
	
	openRequest.onsuccess = function(event) {
		db = openRequest.result;

		if (!newDatabase) {
			// Set value of autosaveHistory variable and change value of switch
			db.transaction(['autosaveHistory']).objectStore('autosaveHistory').get('autosave').onsuccess = function(event) {
				autosaveHistory = event.target.result.val;
				document.getElementById('autosaveInput').checked = autosaveHistory;
				changeAutosave();
				
				databaseOpened = true;
			};
		}

	};

	// Creation of database
	openRequest.onupgradeneeded = function(event) {
		newDatabase = true;
		
		db = event.target.result;

		// history: autoincrement with date index and word
		var historyStore = db.createObjectStore('history', {autoIncrement: true});
		historyStore.createIndex('date', 'date', {unique: false});

		// autosave history: a field whose value is always 'autoSave' is used to access
		var autosaveHistoryStore = db.createObjectStore('autosaveHistory', {keyPath: 'varName'});
		autosaveHistoryStore.add({varName: 'autosave', val: false});
		
		databaseOpened = true;
	};

});