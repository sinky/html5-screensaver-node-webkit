# html5-screensaver-node-webkit

> Screensaver made with HTML5, CSS, Javascript and NodeJS driven by [node-webkit](https://github.com/nwjs/nw.js)

Demo: https://sinky.github.io/html5-screensaver-node-webkit/demo.html

### Usage
Download [node-webkit](http://nwjs.io/) and rename the folder to nwjs and move it into the same folder where the ``screen.nw`` folder is located. 

Run ``.\nwjs\nw.exe screen.nw`` from within this directory to test the screensaver.

Folder structure:  
|- screen.nw/  
|- nwjs/

Use "runscreensaver" as an Windows Screensaver. "runscreensaver" takes any command and runs it as a screensaver.

#### Create screensaver "runscreensaver" from .au3 file

- Download AutoIt as ZIP from https://www.autoitscript.com/site/autoit/downloads/ and extract
- Run ``Aut2Exe\Aut2exe_x64.exe`` an select the ``runscreensaver.au3`` project file
- Click "Convert"
- Rename ``runscreensaver.exe`` to ``runscreensaver.scr``
- run ``runscreensaver.scr /r``

##### Commandline Switches for runscreensaver
```
/c - configure (asks for the command)
/s or none - run screensaver
/p - used to preview inside screensaver system control panel
/r - register this file as screensaver, without need to copy it to Windows dir
```


## License
MIT http://marco.mit-license.org/
