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
                values: {'@background': '#151515', '@foreground': '#BBBBBB',
                        '@links': '#88AAFF', '@linksBackground': 'rgba(87, 187, 255, 0.2)',
                        '@listsHeader': '#FFAA15'}},
            {name: 'black', shownName: 'black',
                values: {'@background': '#000000', '@foreground': '#999999',
                        '@links': '#7799EE', '@linksBackground': 'rgba(65, 165, 235, 0.2)',
                        '@listsHeader': '#EE9900'}},
            {name: 'dawn', shownName: 'dawn',
                values: {'@background': '#DD8800', '@foreground': '#FFFFFF',
                        '@links': '#0044FF', '@linksBackground': 'rgba(0, 0, 87, 0.3)',
                        '@listsHeader': '#AA0000'}},
			{name: 'sunset', shownName: 'sunset',
                values: {'@background': '#880000', '@foreground': '#DDBB88',
                        '@links': '#0044FF', '@linksBackground': 'rgba(0, 0, 87, 0.3)',
                        '@listsHeader': '#DD8800'}},
			{name: 'nightly', shownName: 'nightly',
                values: {'@background': '#001144', '@foreground': '#AACCFF',
                        '@links': '#0044FF', '@linksBackground': 'rgba(0, 0, 87, 0.3)',
                        '@listsHeader': '#FFAA15'}},
            {name: 'sepia', shownName: 'sepia',
                values: {'@background': '#CCCCAA', '@foreground': '#000',
                        '@links': '#0000BB', '@linksBackground': 'rgba(0, 213, 255, 0.3)',
                        '@listsHeader': '#FF4E00'}},
            {name: 'light', shownName: 'light',
                values: {'@background': '#E8E8E8', '@foreground': '#000000',
                        '@links': '#0000BB', '@linksBackground': 'rgba(0, 213, 255, 0.3)',
                        '@listsHeader': '#FF4E00'}}],
		preview: {'this': 'background-color: @background; color: @foreground !important;', 'label': 'color: @foreground !important;', 'a': 'color: @links;',
			'section header': 'color: @listsHeader; border-bottom-color: @listHeader;',
			'input:not(.color)': 'color: @foreground; background-color: @background; filter: brightness(0.8); border-color: @foreground;'}});
    themes.push({name: 'RAESearch', values: [
            {name: 'sepia', shownName: 'sepia',
                values: {'@background_rae': '#CCCCAA'}},
            {name: 'light', shownName: 'light',
                values: {'@background_rae': '#E8E8E8'}}],
		preview: {'this': 'background-color: @background_rae;',
				'input:not(.color)': 'background-color: @background_rae; filter: brightness(0.8);'}});

    var form = [document.getElementById('themes')];
    var callbacks = [callbackThemesClose];
    setTimeout(function() {
		
	}, 500);
	// Open DB and create form
    openCamaLessDb('RAEfox_camaLESSdb', less, themesTypesNames, themes, form, callbacks);
});