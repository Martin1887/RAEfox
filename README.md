RAEfox
======

English:
-------
RAEfox is an open source application under Apache 2.0 license that allows an offline definition search in the castilian dictionary from Wiktionary. Wiktionary offline content has been obtained from OmegaWiki (http://www.omegawiki.org/Special:Ow_downloads), a web site that extracts the Wiktionary content in CSV format. The alphabetical index has been obtained from http://listapalabras.com.

Customizable color themes form creation funcionality is available as library under Apache 2.0 license in https://github.com/Martin1887/camaLESS. The color picker used in camaLESS has been developed by Peter Dematté and it can be found under MIT license in https://github.com/PitPik/colorPicker.

RAEfox is coded in vanilla JavaScript and it uses indexedDB to save history and user preferences (history autosave option and color themes). It uses webL10n (https://github.com/fabi1cazenave/webL10n) as localization library and webworkers to do weighter tasks in another execution thread. RAEfox uses LESS (https://github.com/less/less.js) to dinamically create color themes using camaLESS (https://github.com/Martin1887/camaLESS).

The main funcionalities of RAEfox are below:

-Offline definitions search in Wiktionary.

-Autocompleted words while writing in search bar.

-Words searched history.

-Autosave words in history (disabled by default to protect your privacity).

-Delete selected words or all words from history.

-Alphabetical index.

-Search words by prefix, suffix and/or contained letters.

-Customizable color themes (edit, add and delete themes).

-Three tabs view in large screens.


Español:
-------
RAEfox es una aplicación de código abierto sujeto a la licencia Apache 2.0 que facilita la búsqueda de definiciones sin conexión a Internet en el diccionario de castellano de Wiktionary. El contenido offline de Wiktionary ha sido obtenido de OmegaWiki (http://www.omegawiki.org/Special:Ow_downloads), un sitio web que extrae el contenido de Wiktionary en formato CSV. El índice alfabético de palabras ha sido obtenido de http://listapalabras.com.

La funcionalidad de crear formularios de temas de colores personalizables por el usuario se encuentra disponible como librería bajo la licencia Apache 2.0 en https://github.com/Martin1887/camaLESS. El selector de colores ('color picker') incluido en camaLESS ha sido creado por Peter Dematté y puede encontrarse bajo licencia MIT en https://github.com/PitPik/colorPicker.

RAEfox está desarrollada en JavaScript puro y utiliza indexedDB para el historial de palabras y las preferencias del usuario (autoguardado de historial y temas de colores). Utiliza webL10n (https://github.com/fabi1cazenave/webL10n) como librería de traducciones y webworkers para realizar las tareas más pesadas en otro hilo de ejecución. RAEfox utiliza LESS (https://github.com/less/less.js) para crear temas de colores dinámicos mediante camaLESS (https://github.com/Martin1887/camaLESS).

Las principales funcionalidades de RAEfox son:

-Búsqueda de definiciones en el diccionario de Wiktionary sin conexión a Internet.

-Autocompletado de palabras mientras se escribe en la barra de búsqueda.

-Historial de palabras buscadas.

-Autoguardado de palabras en el historial (desactivado por defecto para proteger tu privacidad).

-Borrar palabras individuales del historial o el historial completo.

-Índice alfabético de palabras.

-Búsqueda de palabras mediante prefijo, sufijo y/o letras contenidas en la palabra.

-Temas de colores personalizables por el usuario (editar, crear y borrar temas).

-Vista de tres pestañas simultáneas cuando el tamaño de la ventana es lo suficientemente grande.
