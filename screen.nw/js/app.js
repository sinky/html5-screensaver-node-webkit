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

// set debug if index.html?debug
if(location.search.length > 0){
  debug = true;
}

if(debug) {
  gui.Window.get().showDevTools();
}

// Try to get files vom scr.imageDir with nodejs
try {
  scr.images = fs.readdirSync("./"+scr.imageDir);
  console.log("Readdir", scr.images);
  scr.images = scr.images.filter(function(el){
    // filter only images
    return checkExtension(el, 'jpg,png,gif');
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

  // Create DOM Elements
  $(scr.images).each(function(i, elm) {
    console.log(elm);

    // Wrapper
    var $photo = $("<div class='photo'>").appendTo('#slides');

    // Image
    var $img = $('<img />')
      .load(function() {
        var $this = $(this);

        // portrait orientation check
        if($this.width() < $this.height()) {
          // is portrait
          $this.parent().addClass('portrait');

          // background blur TODO: onResize
          $this.parent().backgroundBlur({
            imageURL : $this.attr('src'),
            blurAmount : 20,
            imageClass : 'bg-blur'
          });
        }else{
          // is landscape
          // Fit images
          $this.parent().imagefill({throttle: 1000});
        }

        // Exif Data
        try{
          EXIF.getData($this.get(0), function() {

            var exif = EXIF.getAllTags(this);

            var data = [];
            data.push(exif.Make + " " + exif.Model);

            data.push(exif.FocalLength.numerator / exif.FocalLength.denominator + "mm");

            data.push("f/" + exif.FNumber.numerator / exif.FNumber.denominator);
            data.push(exif.ExposureTime.numerator + "/" + exif.ExposureTime.denominator + "s");

            $('<div />').addClass('exif').html(data.join(' - ')).appendTo($this.parent());
            console.log($this.attr('src'), data.join(' - '));

          });
        }catch(e){}

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
<<<<<<< HEAD
  var $current = $('#slides .visible').removeClass('visible');
=======
  var $current = $('#slides .visible');
>>>>>>> origin/master

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

  // in case of first time function call $current was empty
  if(!$newPhoto.length) {
    $newPhoto = $('#slides .photo').first();
  }

  $newPhoto.addClass('visible');
<<<<<<< HEAD
=======
  
  setTimeout(function() {
    $current.removeClass('visible');
  }, 1000);
>>>>>>> origin/master
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
