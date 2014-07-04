var debug = false;
var scr = {
  imageDir: 'images/',
  random: true,
  animation: { 
    duration: 6000, 
    fade: 3000
  }
};

var imageArray, slideInterval, playing;
var mouseDelta = {};
var fs = require('fs');
var gui = require('nw.gui');  

if(debug) {
  gui.Window.get().showDevTools();
}

// Trying to get Files vom scr.imageDir with nodejs
scr.images = fs.readdirSync("./"+scr.imageDir);
console.log("Readdir", scr.images);
scr.images = scr.images.filter(function(el){ 
  // filter only images
  return checkExtension(el, 'jpg,png,gif');
});
console.log("Readdir filtered", scr.images);


jQuery(function($){  
  // Add Transition CSS dynamicly
  if( !$('#transistionCSS').length ) {
    var $transistionCSS = $('<style />').attr('id', 'transistionCSS').text('.photo { -webkit-transition: opacity ' + scr.animation.fade + 'ms; }')
    $transistionCSS.appendTo('head');
  }

  // Prepend imageDir Path
  scr.images = scr.images.map(function(e) {
    return scr.imageDir + e;
  });
   
  // Randomize images
  if(scr.random) {
    console.log('shuffle');
    shuffle(scr.images);
  }
  
  // Create DOM Elements
  $(scr.images).each(function(i, elm) {
    console.log(elm);
    $('<li/>').addClass('photo').css('background-image', 'url(' + elm + ')').appendTo('#slides');
  });   
  
  // Set Event Listeners for "exit on input"
  setEvents();

  // Start Slideshow
  initSlide();
});  // jQuery End


function initSlide() {
// BugFix: setTimeout: Erstes Bild wird sonst nicht gefaded
  setTimeout(function() { 
    // show first image
    $('#slides .photo:first-child').addClass('visible current');
  }, 1);
  
  // Start interval
  startSlide();
}

function startSlide() {
  // Stop running Slideshow
  stopSlide();
  
  // Set Interval to variable
  slideInterval = setInterval(function() {
    // Each Time call changePhoto
    changePhoto();
  }, scr.animation.fade + scr.animation.duration);
  playing = true;
}

function stopSlide() {
  // Stop Intervall
  clearInterval(slideInterval);
  playing = false;
}

function changePhoto(backward) {  
  // Back z-index:0 // fade out
  $('#slides .visible.back').removeClass('visible back');

  // Current z-index:1 // stay visible
  var $current = $('#slides .visible.current');
  $current.removeClass('current').addClass('back');

  // get the next element
  if(backward) {
    var $newPhoto = $current.prev();
    if( $newPhoto.length == 0 ) {
      $newPhoto = $('#slides .photo').last();
    }
  }else{
    var $newPhoto = $current.next();
    if( $newPhoto.length == 0 ) {
      $newPhoto = $('#slides .photo').first();
    }
  }
  // Next z-Index: 2 // fade in 
  $newPhoto.addClass('visible current'); 
}

function setEvents() {
  $(window).mousemove(function(e) {  
    if(!mouseDelta.x) {
      mouseDelta.x = e.pageX;
      mouseDelta.y = e.pageY;
      return false;
    }  
    
    deltax = Math.abs(e.pageX - mouseDelta.x);
    deltay = Math.abs(e.pageY - mouseDelta.y);  
    if(deltax > 20 || deltay > 20){
      endScreensaver(e);
    }
  });

  $(window).on("mousedown keydown", function(e){
    console.log("Event: mousedown||keydown", e);
    if(e.keyCode == 37) { // Prev     
      console.log("keydown", "prev");
      changePhoto(true);
      return false;
    }else if(e.keyCode == 39) { // Next
      console.log("keydown", "next");
      changePhoto();
      return false;
    }else if(e.keyCode == 32) { // Play/Pause
      if(playing){
        console.log("keydown", "stop");
        stopSlide();
        $('#statusPause').removeClass('hide');
        playing = false;
      }else{
        console.log("keydown", "start");
        startSlide();
        $('#statusPause').addClass('hide');
        playing = true;
      }      
      return false;
    }
    if(!debug){
      e.preventDefault();    
    }
    endScreensaver(e);   
  });
}

function endScreensaver(e) {
  //console.log("endScreensaver", e);
  if(!debug){ // don't close on debug-mode
    gui.App.quit();
  }
}

function shuffle(array) { // http://bost.ocks.org/mike/shuffle/
  var m = array.length, t, i;

  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function checkExtension(str, ext) {
 extArray = ext.split(',');

 for(i=0; i < extArray.length; i++) {
  if(str.toLowerCase().split('.').pop() == extArray[i]) {
    return true;
  }
 }
 return false;
};
