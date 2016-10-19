/* 
 * CamaLESS: JavaScript library to customize HTML5 application colors with
 * color themes customizables by users.
 * @author: Marcos Martín Pozo Delgado (user Martin1887 in GitHub)
 */

/**
 * IndexedDB database. Structure is as follows:
 * an array of stores (types of themes) which one with name and values with
 * this structure:
 * name: database internal name
 * shownName: shown name in interface (customizable using l10n)
 * selected: boolean that says which theme is selected (1 or 0)
 * values: object with colors. Indexes are color variable names
 * order: order of theme in store.
 * @type indexedDb
 */ 
var camaLessDb;

/**
 * Different types of color themes in application
 * @type array
 */
var stores;

/**
 * Form without themes error callback
 * @type function
 */
var almostOneThemeCallback;

/**
 * Form with a number of themes with the same name error callback
 * @type function
 * @param name The name of the themes
 */
var sameNameThemesCallback;

/*
 * Localized text variables
 */
var themeName = '';
var themesDifferentName = '';
var almostOneTheme = '';


if (navigator.mozL10n) {
	navigator.mozL10n.ready(function() {
		// grab l10n object
		var _ = navigator.mozL10n.get;
		// Themes title
		themeName = _('themeName');
		themesDifferentName = _('themesDifferentName');
		almostOneTheme = _('almostOneTheme');
	});
}

/*
 * Functions to manipulate database
 */

/**
 * Open camaLESS database with given name (this name must be unique for your
 * application in order to not collide with other applications, a good practice
 * is user your application name as appName_camalesscamaLessDb). It's necessary give at
 * least a objectStore name (each objectStore is a different type of color
 * theme).
 * @param {string} name Database name, must be unique for your application
 * @param {array} types Types of color themes in your application
 * @param {array} defaults Default themes in application (to write in database creation in
 * the first time that the app is opened). The format is an array with name and
 * values attributes where name is the store name and values is its themes.
 * @param {array} forms Forms to be submitted.
 * @param {array} callbacks Callback for every form submission. Can be null.
 * @param {array} formsStores Themes types for every form. Can be null.
 * @param {array} formsClasses CSS class for every form. Can be null.
 * @param {array} formsDataTypes DataType for every form list. Can be null.
 * @param {function} almostOneThemeCB Optional callback for form without themes error.
 * @param {function} sameNameThemesCB Optional callback for form with a number of themes with the same name.
 * @returns true
 */
function openCamaLessDb(name, types, defaults, forms, callbacks, formsStores,
                            formsClasses, formsDataTypes, almostOneThemeCB, sameNameThemesCB) {
    var openRequest = indexedDB.open(name, 1);
    stores = types;
	var newDatabase = false;
		
	if (almostOneThemeCB) {
		almostOneThemeCallback = almostOneThemeCB;
	} else {
		almostOneThemeCallback = function() {alert(almostOneTheme + '.');};
	}
	if (sameNameThemesCB) {
		sameNameThemesCallback = sameNameThemesCB;
	} else {
		sameNameThemesCallback = function(name) {
			alert(themeName + ' ' + name + ' ' + themesDifferentName + '.');
		};
	}
    
    openRequest.onsuccess = function(event) {
        camaLessDb = openRequest.result;
		if (!newDatabase) {
			applyThemesAndCreateForms(forms, callbacks, formsStores, formsClasses, formsDataTypes);
		}
    };
    
    openRequest.onupgradeneeded = function(event) {
		newDatabase = true;
		camaLessDb = event.target.result;
        for (var i = 0; i < stores.length; i++) {
            var objectStore = camaLessDb.createObjectStore(stores[i],
                {keyPath: 'name'});
            objectStore.createIndex('selected', 'selected');
			
			objectStore.transaction.oncomplete = function(e) {
				var added = 0;
				var total = 0;

				for (var i = 0; i < defaults.length; i++) {
					total += defaults[i].values.length;
				}

				for (var i = 0; i < defaults.length; i++) {
					var store = defaults[i].name;
					for (var j = 0; j < defaults[i].values.length; j++) {
						var theme = defaults[i].values[j];
						newColorTheme(theme.name, theme.shownName, theme.values, j + 1, store,
						function() {
							added++;

							if (added === total) {
								applyThemesAndCreateForms(forms, callbacks,
											formsStores, formsClasses, formsDataTypes);
							}
						});
					}
				}
			};
        }
    };
    
    
    return true;
}

/**
 * Apply color themes and create all forms. It is used just after open database.
 * @param {array} forms Forms to be submitted.
 * @param {array} callbacks Callback for every form submission. Can be null.
 * @param {array} formsStores Themes types for every form. Can be null.
 * @param {array} formsClasses CSS class for every form. Can be null.
 * @param {array} formsDataTypes DataType for every form list. Can be null.
 * @returns true
 */
function applyThemesAndCreateForms(forms, callbacks, formsStores, formsClasses, formsDataTypes) {
    applyCamaLessColorTheme();
	
	for (var i = 0; i < forms.length; i++) {
        var stores = null;
        var clas = null;
        var dataType = null;
        var callback = null;
        if (formsStores) {
            stores = formsStores[i];
        }
        if (formsClasses) {
            clas = formsClasses[i];
        }
        if (formsDataTypes) {
            dataType = formsDataTypes[i];
        }
        if (callbacks) {
            callback = callbacks[i];
        }
        // Create form of all types of themes
        createCamaLessForm(stores, forms[i], clas, dataType, callback);
    }
	
    return true;
}

/**
 * Add color theme to the type of color themes.
 * @param {string} name Internal name of theme.
 * @param {object{shownName: string, l10n: boolean}} shownName Object with name
 * shown in interface and boolean indicating if it is data-l10n-id.
 * @param {object{var: string, value: string}} values Object with variables and
 * values.
 * @param {int} order Order of theme in the type of theme. If undefined or null
 * the subsequent of last is chosen.
 * @param {string} store The type of color theme.
 * @param {function} callback Optional success function
 * @returns true
 */
function newColorTheme(name, shownName, values, order, store, callback) {
    var objectStore = camaLessDb.transaction([store], 'readwrite').objectStore(store);
    
    var max = 0;
    if (!order) {
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor && cursor.value.order >= max) {
                max = cursor.value.order + 1;
                cursor.continue();
            }
            order = max;
            
            var request = objectStore.add({name: name, shownName: shownName,
                    values: values, selected: 0, order: order});

            request.onsuccess = function(event) {
				if (order === 1) {
                    if (callback) {
						selectColorTheme(name, store, callback);
					} else {
						selectColorTheme(name, store);
					}
                } else {
					if (callback) {
						callback();
					}
				}
            };
        };
    } else {
        var request = objectStore.add({name: name, shownName: shownName,
                    values: values, selected: 0, order: order});

        request.onsuccess = function(event) {
			if (order === 1) {
                if (callback) {
					selectColorTheme(name, store, callback);
				} else {
					selectColorTheme(name, store);
				}
            } else {
				if (callback) {
					callback();
				}
			}
        };
    }
    
    return true;
}

/**
 * Edit color theme to the type of color themes.
 * @param {string} name Internal name of theme.
 * @param {object{shownName: string, l10n: boolean}} shownName Object with name
 * shown in interface and boolean indicating if it is data-l10n-id.
 * @param {object{var: string, value: string}} values Object with variables and
 * values.
 * @param {int} order Order of theme in the type of theme
 * @param {string} store The type of color theme.
 * @param {function} callback Optional success function
 * @returns true
 */
function editColorTheme(name, shownName, values, order, store, callback) {
    var objectStore = camaLessDb.transaction([store], 'readwrite').objectStore(store);
    var request = objectStore.get(name);
    request.onsuccess = function(event) {
        var data = request.result;
        data.shownName = shownName;
        data.values = values;
        data.order = order;
        objectStore.put(data);
		
		if (callback) {
			callback();
		}
    };
    
    
    return true;
}

/**
 * Remove color theme from type of color themes (and reduce the order index of
 * subsequent themes).
 * @param {string} name The name of color theme.
 * @param {string} store The type of color theme.
 * @param {function} callback Optional success function
 * @returns true
 */
function removeColorTheme(name, store, callback) {
    var objectStore = camaLessDb.transaction([store], 'readwrite').objectStore(store);
	var request = objectStore.delete(name);
	
	request.onsuccess = function(event) {
		if (callback) {
			callback();
		}
	};	
    
    return true;
}


/**
 * Deselect selected color theme and select color theme passed from type of
 * color themes as chosen theme.
 * @param {string} name The name of color theme.
 * @param {string} store The type of color theme.
 * @param {function} callback Optional success function
 * @returns true
 */
function selectColorTheme(name, store, callback) {
	var objectStore = camaLessDb.transaction([store], 'readwrite').objectStore(store);
    var index = objectStore.index('selected');
    index.get(1).onsuccess = function(event) {
		var res = event.target.result;
        if (res) {
            res.selected = 0;
            objectStore.put(res);
        }
		var request = objectStore.get(name);
		request.onsuccess = function(event) {
			var data = request.result;
			data.selected = 1;
			var requestUpdate = objectStore.put(data);

			if (callback) {
				requestUpdate.onsuccess = function() {
					callback();
				};
			}
		};
    };

    
    return true;
}


/*
 * Form
 */

/**
 * Create a camaLESS form with store color themes. If store is undefined all
 * types of color themes are entered in the form.
 * @param {string} store Type of color theme.
 * @param {form} form Form object in which enter fields.
 * @param {string} clas CSS class. Default is camaLessForm.
 * @param {string} dataType List of themes HTML data-type attribute. Default is list.
 * @param {function} callback Function to execute after submit.
 * @returns true
 */
function createCamaLessForm(store, form, clas, dataType, callback) {
    var formStores = store ? [store] : stores;
    clas = clas ? clas : 'camaLessForm';
    dataType = dataType ? dataType : 'list';
    
    // Empty form in order to overwrite it
	form.innerHTML = '';
    var themesListHtml = '<section class="camaLessFormListPanel" data-type="' + dataType + '">';
	if (form.className.indexOf(clas) < 0) {
		form.className += ' ' + clas;
	}
	
    
	var themesFieldsHtml = '';
    
    // It's neccessary knowing when all asynchronous request are finished
    // to add content to form
    var finished = 0;
    var transactions = {};
    var themes = {};
    for (var i = 0; i < formStores.length; i++) {        
        transactions[formStores[i]] = camaLessDb.transaction([formStores[i]], 'readonly');
        var objectStore = transactions[formStores[i]].objectStore(formStores[i]);
        themes[formStores[i]] = [];
        
        objectStore.openCursor().onsuccess = function(event) {
            var currentStore = event.target.source.name;              
            
            var cursor = event.target.result;
            if (cursor) {
                themes[currentStore].push({name: cursor.value.name, shownName: cursor.value.shownName,
                            values: cursor.value.values, selected: cursor.value.selected,
                            order: cursor.value.order});
                cursor.continue();
            }
        };
        
        transactions[formStores[i]].oncomplete = function(event) {
            var currentStore = event.target.objectStoreNames[0];
            
            // Write form only when previous stores have finished
            var interForm = setInterval(function() {
                if (finished === formStores.indexOf(currentStore)) {
                    window.clearInterval(interForm);
                    // Themes sort in function of 'order' field
                    themes[currentStore].sort(function(a, b) { return a.order - b.order; });

                    themesListHtml += '<header data-l10n-id="' + currentStore + '">'
                        + currentStore + '</header>';
                    themesListHtml += '<table data-theme-id="tableForm' + currentStore + finished + '">';
					themesFieldsHtml += '<table data-theme-id="tableFormFields' + currentStore + finished + '">';

                    for (var j = 0; j < themes[currentStore].length; j++) {
                        var theme = themes[currentStore][j];
                        themesListHtml += '<tr data-theme-id="themesListTr' + currentStore + j + '">'
									+ '<td><input type="radio" name="' + currentStore
                                    + '" ' + (theme.selected ? 'checked="checked"' : '')
                                    + '></td>';
                        themesListHtml += '<td class="themeName"><label '
                                + (theme.shownName ?
                                ' data-l10n-id="' + theme.shownName + '"'
                                : '') + '>'
                                + theme.name + '</label></td>';
						// edit button
						themesListHtml += '<td><a class="iconLink" href="#" onclick="return editTheme'
                                    + '(this.parentNode.parentNode.getAttribute(\'data-theme-id\'));"><img width="21" height="21"'
                                    + ' src="images/edit.png" alt="edit"></a>'
                                    + '</td>';
						
						// 'x' button
                        themesListHtml += '<td><a class="iconLink" href="#" onclick="return eraseTheme'
                                    + '(this.parentNode.parentNode);"><img width="21" height="21"'
                                    + ' src="images/erase_cross.png" alt="erase"></a>'
                                    + '</td>';

                        themesListHtml += '</tr>';
						
						
						themesFieldsHtml += '<tr data-theme-id="themesFieldsTr' + currentStore + j + '">';
						themesFieldsHtml += '<td class="themeName"><input type="text" '
                                + (theme.shownName ?
                                ' data-l10n-id="' + theme.shownName + '"'
                                : '') + ' name="' + theme.name + '" value="'
                                + theme.name + '"'
								+ 'onchange="updateName(this.value, this.parentNode.parentNode.getAttribute(\'data-theme-id\'));"></td>';
                        themesFieldsHtml += '<td class="themeColors"><ul>';
                        for (var variable in theme.values) {
                            themesFieldsHtml += '<li>';
                            // Without first '@'
                            themesFieldsHtml += '<label for="' + theme.name + '-'
                                        + variable.substring(1) + '"'
                                        + ' data-l10n-id="'
                                        + variable.substring(1) + '">' + variable.substring(1) + '</label>';
                            // class color for colorPicker
                            themesFieldsHtml += '<input data-colormode="HEX" class="color" name="'
                                        + variable.substring(1) + '[]"'
                                        + ' autocomplete="off" value="' + theme.values[variable]
                                        + '">';
                            themesFieldsHtml += '</li>';
                        }
                        themesFieldsHtml += '</ul></td>';
						themesFieldsHtml += '</tr>';
                    }
                    // '+' button
                    themesListHtml += '<tr><td class="themeAdd" colspan="4"><a href="#" onclick='
                                        + '"return addTheme(this.parentNode.parentNode.parentNode, \''
                                        + currentStore + '\');"><img width="30" '
                                        + 'height="30" src="images/add.png" alt="add"></a>'
                                        + '</td></tr>';

                    themesListHtml += '</table>';
					
					themesFieldsHtml += '</table>';

                    finished++;
					
					
					// This final part of the form is written when all request are completed
					if (finished === formStores.length) {

						themesListHtml += '</section>';
						form.innerHTML += themesListHtml;
						
						form.innerHTML += '<section class="camaLessFormEditPanel">'
							+ '<div class="camaLessFormBackToList" onclick="backToThemesList(\'' + clas + '\');">'
								+ '<img width="30" height="40" src="images/back.png"/>'
							+ '</div>'
							+ '<div class="camaLessFormFields">' + themesFieldsHtml
							+ '</div></section>';
												
						var cancel = document.createElement('button');
						cancel.attributes['data-l10n-id'] = 'cancel';
						cancel.type = 'button';
						cancel.dataset['l10nId'] = 'cancel';
						cancel.onclick = cancelCamaLessForm(store, form, clas, dataType, callback);
						form.innerHTML += '<menu>'
										  + '<button class="recommend" type="submit" '
										  + 'data-l10n-id="save"></button></menu>';
						form.lastChild.insertBefore(cancel, form.lastChild.lastChild);

						addToCamaLessForms(store, form, clas, dataType, callback);

						// l10n strings updated
						if (navigator.mozL10n) {
							navigator.mozL10n.ready ( function () {
								// grab l10n object
								var _ = navigator.mozL10n.get;
								// Themes title
								var toTranslate = document.querySelectorAll('#' + form.id + ' input[type="text"]');
								for (var i = 0; i < toTranslate.length; i++) {
									var l10nId = toTranslate[i].getAttribute('data-l10n-id');
									if (l10nId) {
										toTranslate[i].value = _(l10nId);
										toTranslate[i].setAttribute('value', _(l10nId));
									}
								}
								// Color variables
								toTranslate = document.querySelectorAll('#' + form.id + ' label');
								for (var i = 0; i < toTranslate.length; i++) {
									var l10nId = toTranslate[i].getAttribute('data-l10n-id');
									if (l10nId) {
										toTranslate[i].value = _(l10nId) + ':';
										toTranslate[i].innerHTML = _(l10nId) + ':';
									}
								}

								// Buttons
								toTranslate = document.querySelectorAll('#' + form.id + ' button');
								for (var i = 0; i < toTranslate.length; i++) {
									var l10nId = toTranslate[i].getAttribute('data-l10n-id');
									if (l10nId) {
										toTranslate[i].value  = _(l10nId);
										toTranslate[i].innerHTML = _(l10nId);
									}
								}
								// Headers
								toTranslate = document.querySelectorAll('#' + form.id + ' header');
								for (var i = 0; i < toTranslate.length; i++) {
									var l10nId = toTranslate[i].getAttribute('data-l10n-id');
									if (l10nId) {
										toTranslate[i].innerHTML = _(l10nId);
									}
								}
							});

							// colorPicker in all inputs
							jsColorPicker('input.color', {
								customBG: '#222',
								readOnly: false,
								init: function (elm, colors) {
									elm.style.backgroundColor = elm.value;
									elm.style.color = colors.rgbaMixBGMixCustom.luminance > 0.22 ? '#222' : '#ddd';
								}
							});
							// When write to change background color
							var inputs = document.querySelectorAll('input.color');
							for (var i = 0; i < inputs.length; i++) {
								inputs[i].onkeyup = function() {
									this.style.backgroundColor = this.value;
								};
							}
						}
					}
                }
            }, 100);
        };
    }
    

    return true;
}

/**
 * Update a theme label.
 * @param {string} newValue The new name
 * @param {themeTrDataThemeId} themeTrDataThemeId The theme tr data-theme-id to update.
 * @returns false in order not to follow link
 */
function updateName(newValue, themeTrDataThemeId) {
	var label = document.querySelector('[data-theme-id="'
			+ themeTrDataThemeId.replace('themesFieldsTr', 'themesListTr') + '"] .themeName label');
	label.innerHTML = newValue;
	
	return false;
}

/**
 * Back to themes list
 * @param {string} clas The camaLESS form class name
 * @returns false in order not to follow link
 */
function backToThemesList(clas) {
	var editPanel = document.querySelector('.' + clas + ' .camaLessFormEditPanel');
	var trEditing = document.querySelector('.' + clas + ' .camaLessFormEditPanel tr.editing');
	
	trEditing.className = trEditing.className.replace(' editing', '');
	editPanel.className = editPanel.className.replace(' editing', ' backing');
	
	setTimeout(function() {
		editPanel.className = editPanel.className.replace(' backing', '');
	}, 1000);
	
	// Link must not be followed
	return false;
}

/**
 * Edit a theme showing edit panel.
 * @param {string} themeTrDataThemeId The theme tr data-theme-id to edit.
 * @returns false in order not to follow link
 */
function editTheme(themeTrDataThemeId) {
    
	var themeTr = document.querySelector('[data-theme-id="'
			+ themeTrDataThemeId.replace('themesListTr', 'themesFieldsTr') + '"]');
    themeTr.className += " editing";
	
	// add class to section
	var editPanel = themeTr.parentNode.parentNode.parentNode.parentNode;
	editPanel.className += ' editing';
        
    // Link must not be followed
    return false;
}

/**
 * Erase a DOM tr representing a color theme from the form.
 * @param {themeTr} themeTr The theme tr to erase.
 * @returns false in order not to follow link
 */
function eraseTheme(themeTr) {
    // Deletion is done with fade out transition
    themeTr.addEventListener('animationend', function() {
        themeTr.parentNode.removeChild(themeTr);
		
		var editTr = document.querySelector('[data-theme-id="' + themeTr.getAttribute('data-theme-id')
				.replace('themesListTr', 'themesFieldsTr') + '"]');
		editTr.parentNode.removeChild(editTr);
    });
    
    themeTr.className += " removingNode";
        
    // Link must not be followed
    return false;
}

/**
 * Add a DOM tr representing a color theme to the form
 * @param {table} themeTypeTable The table element in which insert tr
 * @param {string} store Type of color theme
 * @returns false in order not to follow link
 */
function addTheme(themeTypeTable, store) {
    var themesListHtml = '';
	var form = themeTypeTable.parentNode.parentNode.parentNode;
	var themes = form.querySelectorAll('tr[data-theme-id^="themesListTr' + store + '"]').length;
	themesListHtml += '<td><input type="radio" name="' + store
				+ '"></td>';
	themesListHtml += '<td class="themeName"><label data-l10n-id="newTheme">New theme</label></td>';
	// edit button
	themesListHtml += '<td><a href="#" onclick="return editTheme'
				+ '(this.parentNode.parentNode.getAttribute(\'data-theme-id\'));"><img width="14" height="14"'
				+ ' src="images/edit.png" alt="edit"></a>'
				+ '</td>';

	// 'x' button
	themesListHtml += '<td><a href="#" onclick="return eraseTheme'
				+ '(this.parentNode.parentNode);"><img width="14" height="14"'
				+ ' src="images/erase_cross.png" alt="erase"></a>'
				+ '</td>';

	var themesFieldsHtml = '<tr data-theme-id="themesFieldsTr' + store + themes + '">';
    themesFieldsHtml += '<td class="themeName"><input type="text"'
                + 'name="new" value="New theme" data-l10n-id="newTheme"/></td>';
    themesFieldsHtml += '<td class="themeColors"><ul>';
    
    var values;
    var objectStore = camaLessDb.transaction([store], 'readonly').objectStore(store);
    objectStore.openCursor().onsuccess = function(event) {
        // Only 1st theme is taken, all themes of same type have the same vars
        var cursor = event.target.result;
        if (cursor) {
            values = cursor.value.values;
            
            for (var variable in values) {
                themesFieldsHtml += '<li>';
                // Without first '@'
                themesFieldsHtml += '<label for="new-'
                            + variable.substring(1) + '"'
                            + ' data-l10n-id="'
                            + variable.substring(1) + '">' + variable.substring(1) + '</label>';
                // class color for colorPicker
                themesFieldsHtml += '<input data-colormode="HEX" class="color" name="'
                            + variable.substring(1) + '[]"'
                            + ' autocomplete="off" value="#000000">';
                themesFieldsHtml += '</li>';
            }
            themesFieldsHtml += '</ul></td></tr>';


            var tr = document.createElement('tr');
            tr.innerHTML = themesListHtml;
			var trDataThemeId = 'themesListTr' + store + themes;
			tr.setAttribute('data-theme-id', trDataThemeId);
            // Insert before '+' button
            themeTypeTable.insertBefore(tr, themeTypeTable.lastChild);
			
			var fieldsSectionTBody = form.querySelector('table[data-theme-id="'
					+ themeTypeTable.parentNode.getAttribute('data-theme-id')
					.replace('tableForm', 'tableFormFields') + '"]').lastChild;
			// Insert at the end
			fieldsSectionTBody.innerHTML += themesFieldsHtml;


            // l10n strings updated
			if (navigator.mozL10n) {
				navigator.mozL10n.ready(function() {
					// grab l10n object
					var _ = navigator.mozL10n.get;
					
					var label = tr.querySelector('label');
					var l10nId = label.getAttribute('data-l10n-id');
					if (l10nId) {
						label.value = _(l10nId);
						label.innerHTML = _(l10nId);
					}

					// Themes title
					var input = fieldsSectionTBody.lastChild.querySelector('input');
					var l10nId = input.getAttribute('data-l10n-id');
					if (l10nId) {
						input.value = _(l10nId);
						input.setAttribute('value', _(l10nId));
					}

					// Color variables localization
					var lis = fieldsSectionTBody.lastChild.querySelectorAll('label');
					for (var i = 0; i < lis.length; i++) {
						// The first child is the label
						var l10nId = lis[i].getAttribute('data-l10n-id');
						if (l10nId) {
							lis[i].value = _(l10nId) + ':';
							lis[i].innerHTML = _(l10nId) + ':';
						}
					}
				});
			}
            
            // colorPicker in all inputs
            jsColorPicker('input.color', {
                customBG: '#222',
                readOnly: false,
                init: function (elm, colors) {
                    elm.style.backgroundColor = elm.value;
                    elm.style.color = colors.rgbaMixCustom.luminance > 0.22 ? '#222' : '#ddd';
                }
            });
            // When write to change background color
            var inputs = document.querySelectorAll('input.color');
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].onkeyup = function() {
                    this.style.backgroundColor = this.value;
                };
            }
			
			// Go to edit
			editTheme(trDataThemeId);
        }
    };
       
        
    // Link must not be followed
    return false;
}

/**
 * Cancel a camaLESS form recreating it and calling callback function.
 * @param {string} store Type of color theme.
 * @param {string} form Form object in which enter fields.
 * @param {string} clas CSS class.
 * @param {string} dataType List of themes HTML data-type attribute.
 * @param {function} callback Function to execute after submit.
 * @returns true
 */
function cancelCamaLessForm(store, form, clas, dataType, callback) {
    // In order to not execute function in onclick assigment return function
    return function() {
    
        // Form is recreated using database in order to cancel changes
        createCamaLessForm(store, form, clas, dataType, callback);

        if (callback) {
            callback();
        }


        return true;
    };
}

/**
 * Apply camaLESS form submission.
 * @param {string} store Type of color theme.
 * @param {string} form Form object in which enter fields.
 * @param {string} clas CSS class.
 * @param {string} dataType List of themes HTML data-type attribute.
 * @param {function} callback Function to execute after submit.
 * @returns true
 */
function addToCamaLessForms(store, form, clas, dataType, callback) {
    form.callback = callback;
    form.store = store;
    form.clas = clas;
    form.dataType = dataType;
    form.onsubmit = submitCamaLessForm;
    
    return true;
}

/**
 * Create, update, remove and select color themes of given form.
 * @param {string} form Form object.
 * @param {function} callback Function to execute after submit.
 * @returns false in order to finish pending transactions
 */
function submitCamaLessForm(form, callback) {
    form = form.target;
    if (!callback) {
        callback = form.callback;
    }
    var formStores = form.store ? [form.store] : stores;
            
    var formThemes = [];
    
    // Check that color themes names are not duplicated inside the same type of theme
    // and that there are more than 0 color themes in each type
    var tables = form.querySelectorAll(' .camaLessFormEditPanel table');
    
    for (var i = 0; i < tables.length; i++) {
        formThemes.push([]);
        
        var inputs = tables[i].querySelectorAll(' input[type="text"]');
		var listTable = form.querySelector('table[data-theme-id="'
				+ tables[i].getAttribute('data-theme-id')
				.replace('FormFields', 'Form') + '"]');
        var selected = listTable.querySelectorAll(' input:checked');
        
        if (inputs.length === 0 || selected.length === 0) {
            almostOneThemeCallback();
            return false;
        }
        
        var names = [];
        for (var j = 0; j < inputs.length; j++) {
            var name = inputs[j].value;
            if (names.indexOf(name) < 0) {
                names.push(name);
                
                // Color inputs are in next td to name
                var colors = inputs[j].parentNode.nextSibling.querySelectorAll('.color');
                var values = '{';
                for (var k = 0; k < colors.length; k++) {
                    if (k > 0) {
                        values += ',';
                    }
                    // With '@' and without '[]'
                    values += '"@' + colors[k].name.substring(0, colors[k].name.length - 2);
                    values += '": "' + colors[k].value + '"';
                }
                values += '}';
                values = JSON.parse(values);
                
				// shownName '' in order to not change user's choice
                formThemes[i].push({name: name,
                    shownName: '', values: values,
                    selected: form.querySelector('[data-theme-id="'
							+ inputs[j].parentNode.parentNode.getAttribute('data-theme-id')
							.replace('themesFieldsTr', 'themesListTr') + '"]')
							.childNodes[0].lastChild.checked ? 1 : 0
				});
            } else {
                sameNameThemesCallback(name);
                return false;
            }
        }
    }
    
    var completed = 0;
    var transactions = [];
	var toAdd = [];
	var added = 0;
	var toRemove = [];
	var removed = 0;
	var toSelect = [];
	var selected = 0;
    for (var i = 0; i < formStores.length; i++) {
		console.log('formStore ' + i);
		transactions.push(camaLessDb.transaction([formStores[i]], 'readonly'));
        // Get camaLessDb themes
        var objectStore = transactions[i].objectStore(formStores[i]);
        var cursor = objectStore.openCursor();
        cursor.onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                toRemove.push({name: cursor.value.name, store: cursor.source.name});
                cursor.continue();
            } else {
                completed++;
            }
			console.log('Completed ' + completed);
			if (completed === formStores.length) {
				for (var j = 0; j < formThemes.length; j++) {
					for (var k = 0; k < formThemes[j].length; k++) {
						toAdd.push({name: formThemes[j][k].name,
							values: formThemes[j][k].values, store: formStores[j]});

						if (formThemes[j][k].selected) {
							toSelect.push({name: formThemes[j][k].name, store: formStores[j]});
						}
					}
				}
				
				console.log('toRemove, toAdd, toSelect');
				console.log(toRemove);
				console.log(toAdd);
				console.log(toSelect);
				
				// apply changes sequentially: firstly remove all themes, then create all themes,
				// then select selected theme and lastly apply themes,
				// recreate form and execute callback
				for (var r = 0; r < toRemove.length; r++) {
					var removing = toRemove[r];
					removeColorTheme(removing.name, removing.store,
					function() {
						removed++;
						console.log('Removed: ' + removed);
						
						if (removed === toRemove.length) {
							for (var a = 0; a < toAdd.length; a++) {
								var adding = toAdd[a];
								// New themes has no shownName
								newColorTheme(adding.name, '', adding.values, a, adding.store,
								function() {
									added++;
									console.log('Added: ' + added);
									
									if (added === toAdd.length) {
										for (var s = 0; s < toSelect.length; s++) {
											var selecting = toSelect[s];
											selectColorTheme(selecting.name, selecting.store,
											function() {
												selected++;
												console.log('selected: ' + selected);

												if (selected === toSelect.length) {
													console.log('applying');
													
													// Apply themes in every store
													applyCamaLessColorTheme();

													// Form is recreated in order to apply changes
													createCamaLessForm(form.store, form, form.clas, form.dataType, callback);

													if (callback) {
														console.log('callback');
														callback();
													}
												}
											});
										}
									}
								});
							}
						}
					});	
				}
			}
        };
    }
    
    
    return false;
}


/*
 * Change colors
 */

/**
 * Apply selected color theme in store applying its colors to variables.
 * @returns true
 */
function applyCamaLessColorTheme() {
	
	var allVars = {};
	var added = 0;
	stores.forEach(function(store) {
		var objectStore = camaLessDb.transaction([store], 'readonly').objectStore(store);
		var index = objectStore.index('selected');
		index.get(1).onsuccess = function(event) {
			if (event.target.result && event.target.result.values) {
				for (var attr in event.target.result.values) {
					allVars[attr] = event.target.result.values[attr];
				}
				added++;
				
				// modifyVars when all variables of all themes are in allVars
				if (added === stores.length) {
					less.modifyVars(allVars);
				}
			}
		};
	});
	
    
    return true;
}

