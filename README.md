# html5-screensaver-node-webkit

> Screensaver made with HTML5, CSS, Javascript and NodeJS driven by [node-webkit](https://github.com/nwjs/nw.js)

Demo: https://sinky.github.io/html5-screensaver-node-webkit/demo.html

### Usage
Download [node-webkit](http://nwjs.io/) and rename the folder to nwjs and move it into the same folder where the .exe or .scr file is located.

Folder structure:  
|- screen.nw/  
|- nwjs/  
|- screen.exe or screen.scr

#### Register Screensaver
Use regedit and navigate to "HKEY_CURRENT_USER\Control Panel\Desktop" and change or create REG_SZ key "SCRNSAVE.EXE" with path to .scr

### Components

#### screen.exe
Rename to screen.scr
Executable used as Windows Screensaver to launch node-webkit with screensaver app

#### screen.au3
AutoIt Project file of screen.exe www.autoitscript.com

#### screen.nw/
Node-Webkit app folder


## License
MIT http://marco.mit-license.org/
