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

/*
 * Localized text variables
 */
var themeName = '';
var themesDifferentName = '';
var almostOneTheme = '';


navigator.mozL10n.ready(function() {
    // grab l10n object
    var _ = navigator.mozL10n.get;
    // Themes title
    themeName = _('themeName');
    themesDifferentName = _('themesDifferentName');
    almostOneTheme = _('almostOneTheme');
});

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
 * @returns true
 */
function openCamaLessDb(name, types, defaults, forms, callbacks, formsStores,
                            formsClasses, formsDataTypes) {
    var openRequest = indexedDB.open(name, 2);
    stores = types;
    var newDatabase = false;
    
    openRequest.onsuccess = function(event) {
        camaLessDb = openRequest.result;
        
        
        if (newDatabase) {
            // Default themes insertion
            for (var i = 0; i < defaults.length; i++) {
                var store = defaults[i].name;
                for (var j = 0; j < defaults[i].values.length; j++) {
                    var theme = defaults[i].values[j];
                    newColorTheme(theme.name, theme.shownName, theme.values, j + 1, store);
                }
            }
        }
        
        
        // If database is created now it is necessary wait until creation is completed
        if (newDatabase) {
            var applied = false;
            var inter = setInterval(function() {
                // Default themes insertion
                var counts = [];
                for (var i = 0; i < defaults.length; i++) {
                    var store = defaults[i].name;
                    var transaction = camaLessDb.transaction([store]);
                    var objectStore = transaction.objectStore(store);
                    objectStore.count().onsuccess = function(event) {
                        counts.push(event.target.result);
                    };
                    transaction.oncomplete = function(event) {
                        // Check that database has all themes and that all themes
                        // are selected when counts are completed
                        if (counts.length === defaults.length) {
                            var success = true;
                            var finished = 0;
                            for (var i = 0; i < defaults.length; i++) {
                                if (counts[i] !== defaults[i].values.length) {
                                    success = false;
                                    // Loop exit
                                    finished = defaults.length;
                                    break;
                                } else {
                                    var store = defaults[i].name;
                                    var objectStore = camaLessDb.transaction
                                            ([store]).objectStore(store);
                                    var index = objectStore.index('selected');
                                    index.get(1).onsuccess = function(event) {
                                        var res = event.target.result;
                                        if (!res) {
                                            success = false;
                                        }
                                        finished++;
                                    };
                                }
                            }
                            var interLoop = setInterval(function() {
                                if (finished === defaults.length) {
                                    window.clearInterval(interLoop);
                                    if (success) {
                                        window.clearInterval(inter);
                                        // In order to not execute twice doubt to
                                        // inter fires before interLoop has finished
                                        if (!applied) {
                                            applied = true;
                                            applyThemesAndCreateForms(forms, callbacks,
                                                formsStores, formsClasses, formsDataTypes);
                                        }
                                    }
                                }
                            }, 50);
                        }
                    };
                }
            }, 100);
        } else {
            applyThemesAndCreateForms(forms, callbacks, formsStores, formsClasses, formsDataTypes);
        }
    };
    
    openRequest.onupgradeneeded = function(event) {
        camaLessDb = event.target.result;
        for (var i = 0; i < stores.length; i++) {
            var objectStore = camaLessDb.createObjectStore(stores[i],
                {keyPath: 'name'});
            objectStore.createIndex('selected', 'selected');
        }
        newDatabase = true;
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
 * @returns true
 */
function newColorTheme(name, shownName, values, order, store) {
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
                    selectColorTheme(name, store);
                }
            };
        };
    } else {
        var request = objectStore.add({name: name, shownName: shownName,
                    values: values, selected: 0, order: order});

        request.onsuccess = function(event) {
            if (order === 1) {
                selectColorTheme(name, store);
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
 * @returns true
 */
function editColorTheme(name, shownName, values, order, store) {
    var objectStore = camaLessDb.transaction([store], 'readwrite').objectStore(store);
    var request = objectStore.get(name);
    request.onsuccess = function(event) {
        var data = request.result;
        data.shownName = shownName;
        data.values = values;
        data.order = order;
        objectStore.put(data);
    };
    
    
    return true;
}

/**
 * Remove color theme from type of color themes (and reduce the order index of
 * subsequent themes).
 * @param {string} name The name of color theme.
 * @param {string} store The type of color theme.
 * @returns true
 */
function removeColorTheme(name, store) {
    // All elements are searched and only subsequents are modified
    var orderRemoved = 0;
    var themes = [];
    
    var objectStore = camaLessDb.transaction([store], 'readwrite')
                .objectStore(store);
    var request = objectStore.get(name);
    request.onsuccess = function(event) {
        var data = request.result;
        orderRemoved = data.order;
    };
    
    objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor && cursor.value.order > orderRemoved) {
            themes.push({name: cursor.value.name, shownName: cursor.value.shownName,
                        values: cursor.value.values, selected: cursor.value.selected,
                        order: cursor.value.order});
            cursor.continue();
        }
        
        for (var i = 0; i < themes.length; i++) {
            editColorTheme(themes[i].name, themes[i].shownName, themes[i].values,
                            themes[i].order - 1);
        }
    };
    
    
    camaLessDb.transaction([store], 'readwrite').objectStore(store).delete(name);     
    
    return true;
}


/**
 * Deselect selected color theme and select color theme passed from type of
 * color themes as chosen theme.
 * @param {string} name The name of color theme.
 * @param {string} store The type of color theme.
 * @returns true
 */
function selectColorTheme(name, store) {
    var objectStore = camaLessDb.transaction([store], 'readwrite').objectStore(store);
    var index = objectStore.index('selected');
    index.get(1).onsuccess = function(event) {
        var res = event.target.result;
        if (res) {
            res.selected = 0;
            objectStore.put(res);
        }
    };
    
    var request = objectStore.get(name);
    request.onsuccess = function(event) {
        var data = request.result;
        data.selected = 1;
        objectStore.put(data);
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
 * @param {string} form Form object in which enter fields.
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
    var formInnerHTML = '<section data-type="' + dataType + '">';
    form.className += ' ' + clas;
    
    var listThemes = '';
    
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

                    listThemes += '<header data-l10n-id="' + currentStore + '">'
                        + currentStore + '</header>';
                    listThemes += '<table id="tableForm' + finished + '">';

                    for (var j = 0; j < themes[currentStore].length; j++) {
                        var theme = themes[currentStore][j];
                        listThemes += '<tr><td><input type="radio" name="' + currentStore
                                    + '" ' + (theme.selected ? 'checked="checked"' : '')
                                    + '/></td>';
                        listThemes += '<td class="themeName"><input type="text"'
                                + (theme.shownName ?
                                ' data-l10n-id="' + theme.shownName + '"'
                                : '') + 'name="' + theme.name + '" value="'
                                + theme.name + '"></td>';
                        listThemes += '<td class="themeColors"><ul>';
                        for (var variable in theme.values) {
                            listThemes += '<li>';
                            // Without first '@'
                            listThemes += '<label for="' + theme.name + '-'
                                        + variable.substring(1) + '"'
                                        + ' data-l10n-id="'
                                        + variable.substring(1) + '"></label>';
                            // class color for colorPicker
                            listThemes += '<input data-colormode="HEX" class="color" id="' + theme.name + '-'
                                        + variable.substring(1) + '" name="'
                                        + variable.substring(1) + '[]"'
                                        + ' autocomplete="off" value="' + theme.values[variable]
                                        + '">';
                            listThemes += '</li>';
                        }
                        listThemes += '</ul></td>';

                        // 'x' button
                        listThemes += '<td><a href="#" onclick="return eraseTheme'
                                    + '(this.parentNode.parentNode);"><img width="14" height="14"'
                                    + 'src="images/erase_cross.png" alt="erase"></a>'
                                    + '</td>';

                        listThemes += '</tr>';
                    }
                    // '+' button
                    listThemes += '<tr><td class="themeAdd" colspan="4"><a href="#" onclick='
                                        + '"return addTheme(this.parentNode.parentNode.parentNode, \''
                                        + currentStore + '\');"><img width="20" '
                                        + 'height="20" src="images/add.png" alt="add"></a>'
                                        + '</td></tr>';

                    listThemes += '</table>';

                    finished++;
                }
            }, 100);
        };
    }
    
    // This final part of the form is written when all request are completed:
    // Each 200 ms this is checked and when it happens the interval is cleaned
    // to not execute more times and final part of form is written
    var interv = setInterval(function() {
        if (finished === formStores.length) {
            window.clearInterval(interv);
            
            form.innerHTML += formInnerHTML + listThemes + '</section>';
            
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
            navigator.mozL10n.ready ( function () {
                // grab l10n object
                var _ = navigator.mozL10n.get;
                // Themes title
                var inputs = document.querySelectorAll('#' + form.id + ' input[type="text"]');
                for (var i = 0; i < inputs.length; i++) {
                    var l10nId = inputs[i].getAttribute('data-l10n-id');
                    if (l10nId) {
                        inputs[i].value = _(l10nId);
                    }
                }
                // Color variables
                inputs = document.querySelectorAll('#' + form.id + ' label');
                for (var i = 0; i < inputs.length; i++) {
                    var l10nId = inputs[i].getAttribute('data-l10n-id');
                    if (l10nId) {
                        inputs[i].value = _(l10nId) + ':';
                        inputs[i].innerHTML = _(l10nId) + ':';
                    }
                }
                
                // Buttons
                inputs = document.querySelectorAll('#' + form.id + ' button');
                for (var i = 0; i < inputs.length; i++) {
                    var l10nId = inputs[i].getAttribute('data-l10n-id');
                    if (l10nId) {
                        inputs[i].value  = _(l10nId);
                        inputs[i].innerHTML = _(l10nId);
                    }
                }
                // Headers
                inputs = document.querySelectorAll('#' + form.id + ' header');
                for (var i = 0; i < inputs.length; i++) {
                    var l10nId = inputs[i].getAttribute('data-l10n-id');
                    if (l10nId) {
                        inputs[i].innerHTML = _(l10nId);
                    }
                }
            });
            
            // colorPicker in all inputs
            var colors = jsColorPicker('input.color', {
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
        }
    }, 200);
    
    
    return true;
}

/**
 * Erase a DOM tr representing a color theme from the form.
 * @param {themeTr} themeTr The theme tr to erase.
 * @returns false
 */
function eraseTheme(themeTr) {
    // Deletion is done with fade out transition
    themeTr.addEventListener('animationend', function() {
        themeTr.parentNode.removeChild(themeTr);
    });
    
    themeTr.className += " removingNode";
        
    // Link must not be followed
    return false;
}

/**
 * Add a DOM tr representing a color theme to the form
 * @param {table} themeTypeTable The table element in which insert tr
 * @param {string} store Type of color theme
 * @returns {Boolean}
 */
function addTheme(themeTypeTable, store) {
    var newTheme = '';
    newTheme += '<td><input type="radio" name="' + store + '"/></td>';
    newTheme += '<td class="themeName"><input type="text"'
                + 'name="new" value="New theme" data-l10n-id="newTheme"/></td>';
    newTheme += '<td class="themeColors"><ul>';
    
    var values;
    var objectStore = camaLessDb.transaction([store], 'readonly').objectStore(store);
    objectStore.openCursor().onsuccess = function(event) {
        // Only 1st theme is taken, all themes of same type have the same vars
        var cursor = event.target.result;
        if (cursor) {
            values = cursor.value.values;
            
            for (var variable in values) {
                newTheme += '<li>';
                // Without first '@'
                newTheme += '<label for="new-'
                            + variable.substring(1) + '"'
                            + ' data-l10n-id="'
                            + variable.substring(1) + '"></label>';
                // class color for colorPicker
                newTheme += '<input data-colormode="HEX" class="color" id="new-'
                            + variable.substring(1) + '" name="'
                            + variable.substring(1) + '[]"'
                            + ' autocomplete="off" value="#000000">';
                newTheme += '</li>';
            }
            newTheme += '</ul></td>';

            // 'x' button
            newTheme += '<td><a href="#" onclick="return eraseTheme'
                        + '(this.parentNode.parentNode);"><img width="14" height="14"'
                        + 'src="images/erase_cross.png" alt="erase"></a>'
                        + '</td>';

            var tr = document.createElement('tr');
            tr.innerHTML = newTheme;

            // Insert before '+' button
            themeTypeTable.insertBefore(tr, themeTypeTable.lastChild);


            // l10n strings updated
            navigator.mozL10n.ready(function() {
                // grab l10n object
                var _ = navigator.mozL10n.get;
                
                // Themes title
                var input = tr.childNodes[1].childNodes[0];
                var l10nId = input.getAttribute('data-l10n-id');
                if (l10nId) {
                    input.value = _(l10nId);
                }

                // Color variables localization
                var lis = tr.childNodes[2].childNodes[0].childNodes;
                for (var i = 0; i < lis.length; i++) {
                    // The first child is the label
                    var l10nId = lis[i].childNodes[0].getAttribute('data-l10n-id');
                    if (l10nId) {
                        lis[i].childNodes[0].value = _(l10nId) + ':';
                        lis[i].childNodes[0].innerHTML = _(l10nId) + ':';
                    }
                }
            });
            
            // colorPicker in all inputs
            var colors = jsColorPicker('input.color', {
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
 * @returns true
 */
function submitCamaLessForm(form, callback) {
    form = form.target;
    if (!callback) {
        callback = form.callback;
    }
    var formStores = form.store ? [form.store] : stores;
            
    var camaLessDbThemes = [];
    var formThemes = [];
    
    // Check that color themes names are not duplicated inside the same type of theme
    // and that there are more than 0 color themes in each type
    var tables = document.querySelectorAll('#' + form.id + ' table');
    
    for (var i = 0; i < tables.length; i++) {
        formThemes.push([]);
        
        var inputs = document.querySelectorAll('#' + tables[i].id + ' input[type="text"]');
        var selected = document.querySelectorAll('#' + tables[i].id + ' input:checked');
        
        if (inputs.length === 0 || selected.length === 0) {
            alert(almostOneTheme + '.');
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
                // ShownName now values '' to not overwrite new name
                formThemes[i].push({name: inputs[j].value,
                    shownName: inputs[j].value.shownName, values: values,
                    selected: inputs[j].parentNode.previousSibling.childNodes[0].checked ? 1 : 0});
            } else {
                alert(themeName + ' ' + name + ' ' + themesDifferentName + '.');
                return false;
            }
        }
    }
    
    var completed = 0;
    var transactions = [];
    for (var i = 0; i < formStores.length; i++) {
        camaLessDbThemes.push([]);
        transactions[i] = camaLessDb.transaction([formStores[i]], 'readonly');
        // Get camaLessDb themes
        var objectStore = transactions[i].objectStore(formStores[i]);
        var cursor = objectStore.openCursor();
        cursor.onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                camaLessDbThemes[completed].push({name: cursor.value.name, shownName: cursor.value.shownName,
                            values: cursor.value.values, selected: cursor.value.selected});
                cursor.continue();
            } else {
                completed++;
            }
        };
    }
    
    var inter = setInterval(function() {
        if (completed === formStores.length) {
            window.clearInterval(inter);
            // Check color themes
            for (var j = 0; j < formThemes.length; j++) {
                for (var k = 0; k < formThemes[j].length; k++) {
                    var ind = camaLessDbThemes[j].indexOf(formThemes[j][k]);
                    if (ind > -1) {
                        // Update color theme (shownName is '' to not overwrite new name)
                        editColorTheme(formThemes[j][k].name, '',
                            formThemes[j][k].values, formStores[j]);
                    } else {
                        // Add new color theme (shownName is '' to not overwrite new name)
                        newColorTheme(formThemes[j][k].name, '',
                            formThemes[j][k].values, formThemes.length, formStores[j]);
                    }

                    // Select selected color theme
                    if (formThemes[j][k].selected) {
                        selectColorTheme(formThemes[j][k].name, formStores[j]);
                    }
                }
            }

            for (var j = 0; j < camaLessDbThemes.length; j++) {
                for (var k = 0; k < camaLessDbThemes[j].length; k++) {
                    var ind = formThemes[j].indexOf(camaLessDbThemes[j][k]);
                    if (ind < 0) {
                        // Remove removed color themes
                        removeColorTheme(camaLessDbThemes[j][k].name, formStores[j]);
                    }
                }
            }

            // Apply themes in every store
            applyCamaLessColorTheme();

            // Form is recreated in order to apply changes
            createCamaLessForm(form.store, form, form.clas, form.dataType, callback);

            if (callback) {
                callback();
            }
        }
    }, 200);
    
    
    return true;
}


/*
 * Change colors
 */

/**
 * Apply selected color theme in store applying its colors to variables.
 * @param {string} store Type of color theme to select. If undefined all stores
 * are changed.
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

