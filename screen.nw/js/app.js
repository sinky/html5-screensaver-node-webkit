var debug = true;
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
var map;

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
  $('<style />').text('.photo { transition: opacity ' + scr.animation.fade + 'ms cubic-bezier(.3,.8,.5,1); }').appendTo('head');

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
    
    // Wrapper
    var $photo = $("<div class='photo'>").appendTo('#slides');
    
    // Image
    var $img = $('<img />')
      .load(function() {
        // portrait orientation check
        var $this = $(this);  
        
        if($this.width() < $this.height()) {
          // portrait
          $this.parent().addClass('portrait');
          
          // background blur TODO: onResize
          $this.parent().backgroundBlur({
            imageURL : $this.attr('src'),
            blurAmount : 20,
            imageClass : 'bg-blur'
          }); 
        }else{
          // landscape
          // Fit images
          $this.parent().imagefill({throttle: 1000});
        }
        
      })
      .attr('src', elm)
      .appendTo($photo);
  });
    
  // Set Event Listeners for "exit on input"
  setEvents();

  // Start Slideshow
  initSlide();
  
});  // jQuery End


function initSlide() {

  // show first image when loaded
  $('#slides .photo:first-child img').load(function() {
    //$(this).parent().addClass('visible');
    changePhoto();
  });
  
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
function resetSlideInterval() {
  stopSlide();
  startSlide();
}

function changePhoto(backward) {  
  var $current = $('#slides .visible').removeClass('visible');
  
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
  
  // in case of first function call $current was empty
  if(!$newPhoto.length) {
    $newPhoto = $('#slides .photo').first();
  }
  
  /*   https://rawgit.com/exif-js/exif-js/master/exif.js
  EXIF.getData($newPhoto.find('img').get(0), function() {
    var lat = EXIF.getTag(this, "GPSLatitude");
    var lng = EXIF.getTag(this, "GPSLongitude");

    var latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";  
    var lonRef = EXIF.getTag(this, "GPSLongitudeRef") || "W";  
    
    lat = (lat[0] + lat[1]/60 + lat[2]/3600) * (latRef == "N" ? 1 : -1);  
    lng = (lng[0] + lng[1]/60 + lng[2]/3600) * (lonRef == "W" ? -1 : 1);   
  });*/

  $newPhoto.addClass('visible'); 
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
      resetSlideInterval();
      return false;
    }else if(e.keyCode == 39) { // Next
      console.log("keydown", "next");
      changePhoto();
      resetSlideInterval();
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