WGSA Front End
==========

Front end code for the WGSA system.

Install
----------------
`npm install`

Run
----------------
`[sudo] npm start`

Open `http://localhost` in your browser.

### Supported FASTA file extensions
* .fa
* .fas
* .fna
* .ffn
* .faa
* .frn
* .contig

Troubleshooting
----------------
When the node app runs as expected, but the page doesn't look/work as expected then it's very likely that your browser serves cached (i.e. old) js/css files. To validate, open Incognito Window in Chrome or disable cache in Chrome Developer Tools (Cmd + Alt + I > Settings > Disable cache) and reload your page.

If that didn't help, check if you get JS error in Chrome Developer Tools Console (Cmd + Alt + J).

Development Notes
----------------

`.wgst--hide-this` class uses `display: none;` - can not render `canvas` when it's parent element is not displayed.

`.wgst--invisible-this` class uses `visibility: hidden;` - can render `canvas` when it's parent element is invisible.

### UI Logic

### 1. Containers

There are 3 types of containers:
1. Container - top level class of containers.
2. Fullscreen - maximised container.
3. Panel - minimised container.

Other types (yet to be defined):
1. Overlay - container on top of all other containers.
2. Background - container underneath of all other containers.

Containers are controlled via hidables. Each container has its own hidable. All other container controls are aliases and internally should trigger hidable controls.

### 2. Hidables

Hidables represent containers state. Hidables are created and destroyed with containers. Each container comes with a single hidable. When hidable is created it is displayed on the sidebar. Hidables allow to manipulate containers.

Hidables must not be created/removed directly. They can be manipulated only by manipulating containers.

