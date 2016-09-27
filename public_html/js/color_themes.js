document.addEventListener('DOMContentLoaded', function() {

    var themesTypesNames = [];
    themesTypesNames.push('Application');
    themesTypesNames.push('RAESearch');

    /*
     * By default 2 types of themes: application and RAE search (only background
     * color in this) with 4 themes for the first and 2 for the second.
     * First theme of each type is selected.
     */
    var themes = [];
    themes.push({name: 'Application', values: [
            {name: 'dark', shownName: 'dark',
                values: {'@background': '#151515', '@foreground': '#BBB',
                        '@links': '#8AF', '@linksBackground': 'rgba(87, 187, 255, 0.2)',
                        '@listsHeader': '#FFAA15'}},
            {name: 'black', shownName: 'black',
                values: {'@background': '#000', '@foreground': '#999',
                        '@links': '#79E', '@linksBackground': 'rgba(65, 165, 235, 0.2)',
                        '@listsHeader': '#E90'}},
            {name: 'sepia', shownName: 'sepia',
                values: {'@background': '#CCA', '@foreground': '#000',
                        '@links': '#00B', '@linksBackground': 'rgba(0, 213, 255, 0.3)',
                        '@listsHeader': '#FF4E00'}},
            {name: 'light', shownName: 'light',
                values: {'@background': '#E8E8E8', '@foreground': '#000',
                        '@links': '#00B', '@linksBackground': 'rgba(0, 213, 255, 0.3)',
                        '@listsHeader': '#FF4E00'}}]});
    themes.push({name: 'RAESearch', values: [
            {name: 'sepia', shownName: 'sepia',
                values: {'@background_rae': '#CCA'}},
            {name: 'light', shownName: 'light',
                values: {'@background_rae': '#E8E8E8'}}]});

    var form = [document.getElementById('themes')];
    var callbacks = [callbackThemesClose];
    // Open DB and create form
    openCamaLessDb('RAEfox_camaLESSdb40', themesTypesNames, themes, form, callbacks);
});