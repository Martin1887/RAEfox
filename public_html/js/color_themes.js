document.addEventListener('DOMContentLoaded', function() {

    var themesTypesNames = [];
    themesTypesNames.push('ColorThemes');

    /*
     * Preset themes
     */
    var themes = [];
    themes.push({name: 'ColorThemes', values: [
            {name: 'dark', shownName: 'dark',
                values: {'@background': '#151515', '@foreground': '#BBBBBB',
                        '@links': '#88AAFF', '@linksBackground': 'rgba(87, 187, 255, 0.2)',
                        '@listsHeader': '#FFAA15'}},
            {name: 'black', shownName: 'black',
                values: {'@background': '#000000', '@foreground': '#999999',
                        '@links': '#7799EE', '@linksBackground': 'rgba(65, 165, 235, 0.2)',
                        '@listsHeader': '#EE9900'}},
            {name: 'dawn', shownName: 'dawn',
                values: {'@background': '#BB7700', '@foreground': '#FFDDDD',
                        '@links': '#0022FF', '@linksBackground': 'rgba(87, 40, 0, 0.3)',
                        '@listsHeader': '#AA0000'}},
			{name: 'sunset', shownName: 'sunset',
                values: {'@background': '#660000', '@foreground': '#BB9977',
                        '@links': '#4488FF', '@linksBackground': 'rgba(87, 0, 0, 0.3)',
                        '@listsHeader': '#FFAA00'}},
			{name: 'nightly', shownName: 'nightly',
                values: {'@background': '#001544', '@foreground': '#99BBDD',
                        '@links': '#77AAFF', '@linksBackground': 'rgba(0, 0, 0, 0.3)',
                        '@listsHeader': '#FFAA15'}},
            {name: 'sepia', shownName: 'sepia',
                values: {'@background': '#CCCCAA', '@foreground': '#000000',
                        '@links': '#0000BB', '@linksBackground': 'rgba(0, 213, 255, 0.3)',
                        '@listsHeader': '#FF4E00'}},
            {name: 'light', shownName: 'light',
                values: {'@background': '#E8E8E8', '@foreground': '#000000',
                        '@links': '#0000BB', '@linksBackground': 'rgba(0, 213, 255, 0.3)',
                        '@listsHeader': '#DD4E00'}}],
		preview: {'this': 'background: @background; color: @foreground !important;',
			'label': 'color: @foreground !important;', 'a': 'color: @links;',
			'section header': 'color: @listsHeader; border-bottom-color: @listsHeader;',
			'input:not(.color),.camaLessForm input[type="radio"] ~ span':
				'color: @foreground; background-color: @background; filter: brightness(0.8); border-color: @foreground;'}});
    

    var form = [document.getElementById('themes')];
    var callbacks = [callbackThemesClose];
	
	// Open DB and create form
    openCamaLessDb('RAEfox_camaLESSdb', less, themesTypesNames, themes, form, callbacks);
});