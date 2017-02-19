var debug = false;
var scr = {
  imageDir: 'images/',
  random: true,
  animation: {
    duration: 6000,
    fade: 3000
  }
};
// test
var slideInterval, playing;
var mouseDelta = {};
var fs = require('fs');
var win = nw.Window.get();
var app = nw.App;

// debug
if(app.fullArgv.indexOf('--debug') != -1){
  debug = true;
  win.leaveKioskMode();
  win.showDevTools();
  console.log('win', win);
}

// Try to get files vom scr.imageDir with nodejs
try {
  scr.images = fs.readdirSync("./"+scr.imageDir);
  console.log("Readdir", scr.images);
  // filter only images
  scr.images = scr.images.filter(function(el){
    return checkExtension(el, 'jpg,jpeg,png,gif');
  });
  console.log("Readdir filtered", scr.images);
}catch(e) {
  alert(e);
}

if(scr.images.length < 1) {
  alert('Keine Fotos im Ordner ' + './' + scr.imageDir + ' gefunden.');
}

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

  // Clone Array
  var images = scr.images.slice();

  // Create DOM Elements, one after the other
  // processImage calls itself on image load event
  var processImage = function() {
    if(!images.length) { return false; }

    var imgPath = images.shift();

    //console.log(imgPath);

    // Wrapper
    var $photo = $("<div/>").addClass('photo').appendTo('#slides');

    // Image
    var $img = $('<img/>')
      .attr('src', imgPath)
      .appendTo($photo)
      .load(function() {
        var $this = $(this);

        // portrait orientation check
        if($this.width() < $this.height()) {
          // is portrait
          $this.parent().addClass('portrait');

          // background blur
          // TODO: add onResize
          $this.parent().backgroundBlur({
            imageURL : $this.attr('src'),
            blurAmount : 20,
            imageClass : 'bg-blur'
          });
        }else{
          // is landscape
          // Fit image
          $this.parent().imagefill({throttle: 200});
        }

        // Exif Data
        try{
          EXIF.getData($this.get(0), function() {

            var exif = EXIF.getAllTags(this);

            //console.log(exif);

            var data = [];
            data.push(exif.Make + " " + exif.Model);

            data.push(exif.FocalLength.numerator / exif.FocalLength.denominator + "mm");

            data.push("f/" + exif.FNumber.numerator / exif.FNumber.denominator);
            data.push(exif.ExposureTime.numerator + "/" + exif.ExposureTime.denominator + "s");

            if(typeof exif.ImageDescription != 'undefined'){
              if(exif.ImageDescription.trim()) {
                data.push(exif.ImageDescription);
              }
            }

            $('<div />').addClass('exif').html(data.join(' - ')).appendTo($this.parent());

          });
        }catch(e){
          console.error('EXIF', e);
        }

        // Load Next Image
        processImage();
      });
  };
  processImage();

  // Set Event Listeners for "exit on input"
  setEvents();

  // Start Slideshow
  initSlide();

});  // jQuery End


function initSlide() {
  // show first image when loaded
  $('#slides .photo:first-child img').load(function() {
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
    changePhoto();
  }, scr.animation.fade + scr.animation.duration);
  playing = true;
}

function stopSlide() {
  // Stop Intervall
  clearInterval(slideInterval);
  slideInterval = false;
  playing = false;
}
function resetSlideInterval() {
  // reset Intervall
  if(slideInterval) {
    stopSlide();
    startSlide();
  }
}

function changePhoto(backward) {
  var $current = $('#slides .visible').removeClass('visible');
  var $nextPhoto;

  // get the next image acccording direction
  if(backward) {
    $nextPhoto = $current.prev();
    if( $nextPhoto.length === 0 ) {
      $nextPhoto = $('#slides .photo').last();
    }
  }else{
    $nextPhoto = $current.next();
    if( $nextPhoto.length === 0 ) {
      $nextPhoto = $('#slides .photo').first();
    }
  }

  // in case of first call $current is empty
  if(!$nextPhoto.length) {
    $nextPhoto = $('#slides .photo').first();
  }

  $nextPhoto.addClass('visible');
}



function setEvents() {
  $(window).mousemove(function(e) {
    if(!mouseDelta.x) {
      mouseDelta.x = e.pageX;
      mouseDelta.y = e.pageY;
      return false;
    }

    var deltax = Math.abs(e.pageX - mouseDelta.x);
    var deltay = Math.abs(e.pageY - mouseDelta.y);
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
    win.close();
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
 var extArray = ext.split(',');

 for(var i=0; i < extArray.length; i++) {
  if(str.toLowerCase().split('.').pop() == extArray[i]) {
    return true;
  }
 }
 return false;
}