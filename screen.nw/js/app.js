var debug = false;
var scr = {
  imageDir: 'images/',
  random: true,
  animation: {
    duration: 6000,
    fade: 3000
  },
  portraitBackground: 'css3blur', // Options: svgblur, css3blur or gradient
  exif: {
    showData: true,
    showMap: false
  }
};
var googleStaticMapsURL = 'http://maps.googleapis.com/maps/api/staticmap?center={{center}}&zoom=2&scale=1&size=350x150&maptype=roadmap&format=png&visual_refresh=true&markers=size:tiny%7Ccolor:0x019cef%7Clabel:%7C{{center}}';

var slideInterval, playing;
var mouseDelta = {};

var isNode = (typeof process !== "undefined" && typeof require !== "undefined");
var isNodeWebkit = (function() {
  if(isNode) {
    try {
      return (typeof require('nw.gui') !== "undefined");
    } catch(e) {
      return false;
    }
  }else{
    return false;
  }
})();

if(isNodeWebkit) {
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
    var fs = require('fs');
    scr.images = fs.readdirSync("./"+scr.imageDir);
    console.log("Readdir", scr.images);
    // filter only images
    scr.images = scr.images.filter(function(el){
      return checkExtension(el, 'jpg,jpeg,png,gif');
    });

    // Prepend imageDir Path
    scr.images = scr.images.map(function(e) {
      return scr.imageDir + e;
    });

    console.log("Readdir filtered", scr.images);
  }catch(e) {
    alert(e);
  }
}else{
  // no NWSJ using demo images
  scr.images = [
    'images/demo1.jpg',
    'images/demo2.jpg',
    'images/demo3.jpg',
    'images/demo4.jpg',
    'images/demo5.jpg'
  ];
}

if(scr.images.length < 1) {
  alert('Keine Fotos im Ordner ' + './' + scr.imageDir + ' gefunden.');
}

jQuery(function($){
  // Add Transition CSS dynamicly
  $('<style />').text('.photo { transition: opacity ' + scr.animation.fade + 'ms cubic-bezier(.3,.8,.5,1); }').appendTo('head');

  // Hide exif or map if localstorage setting is (String)true
  if(localStorage.getItem("screensaver.hideExif") == "true") {
    $('<style />').text('.photo .exif { display: none; }').appendTo('head');
  }
  if(localStorage.getItem("screensaver.hideMap") == "true") {
    $('<style />').text('.photo .map { display: none; }').appendTo('head');
  }

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
    var $image = $("<div/>").addClass('image').appendTo($photo);

    // Image
    var $img = $('<img/>')
      .attr('src', imgPath)
      .appendTo($image)
      .on('load', function() {
        var $this = $(this);

        // portrait orientation check
        if($this.width() < $this.height()) {
          // is portrait
          $this.parents('.photo').addClass('portrait');

          if(scr.portraitBackground == 'css3blur') {
            // background css3 blur
            $("<div/>").addClass('bg-css3blur').css('background-image', 'url('+imgPath+')').appendTo($this.parents('.photo'));
          }else if(scr.portraitBackground == 'svgblur') {
            // background svg blur
            // TODO: add onResize
            $this.parents('.photo').backgroundBlur({
              imageURL : $this.attr('src'),
              blurAmount : 20,
              imageClass : 'bg-svgblur'
            });
          }else if(scr.portraitBackground == 'gradient') {
            // background gradient
            Grade($this.parents('.photo').get(0));
          }

        }else{
          // is landscape
          // Fit image
          $this.parent().imagefill({throttle: 200});
        }

        // Exif Data
        if(scr.exif.showData || exif.showMap) {
          try{
            EXIF.getData($this.get(0), function() {

              var exif = EXIF.getAllTags(this);
              var lat = exif.GPSLatitude;
              var lon = exif.GPSLongitude;

              console.log(exif);

              // show exif data
              if(scr.exif.showData) {
                var data = [];
                data.push(exif.Make + " " + exif.Model);

                data.push(exif.FocalLength.numerator / exif.FocalLength.denominator + "mm");

                data.push("f/" + exif.FNumber.numerator / exif.FNumber.denominator);
                data.push(exif.ExposureTime.numerator + "/" + exif.ExposureTime.denominator + "s");
                data.push("ISO " + exif.ISOSpeedRatings);

                if(typeof exif.ImageDescription != 'undefined'){
                  if(exif.ImageDescription.trim()) {
                    data.push(exif.ImageDescription.trim());
                  }
                }

                $('<div />').addClass('exif').html(data.join(' - ')).appendTo($this.parents('.photo'));
              }

              // show exif Map
              if(scr.exif.showMap && exif['GPSLatitude'] && exif['GPSLongitude']) {
                var lat = to_decimal(exif['GPSLatitude'][0], exif['GPSLatitude'][1], exif['GPSLatitude'][2], exif['GPSLatitudeRef']);
                var lng = to_decimal(exif['GPSLongitude'][0], exif['GPSLongitude'][1], exif['GPSLongitude'][2], exif['GPSLongitudeRef']);
                //console.log(imgPath, lat +','+lng);

                var mapImgURL = googleStaticMapsURL.replace(/{{center}}/g, lat + ',' + lng);
                var $mapImg = $('<img />').attr('src', mapImgURL)
                $('<div />').addClass('map').append($mapImg).appendTo($this.parents('.photo'));
              }
            });
          }catch(e){
            console.error('EXIF', e);
          }
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
  $('#slides .photo:first-child img').on('load', function() {
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
    }else if(e.keyCode == 69) { // e
      $('.photo .exif').fadeToggle();
      localStorage.setItem("screensaver.hideExif", $('.photo .exif').is(":not(:visible)"));
    }else if(e.keyCode == 77) { // m
      $('.photo .map').fadeToggle();
      localStorage.setItem("screensaver.hideMap", $('.photo .map').is(":not(:visible)"));
    }
    if(!debug){
      e.preventDefault();
    }
    endScreensaver(e);
  });
}

function endScreensaver(e) {
  if(isNodeWebkit && !debug){ // don't close on debug-mode
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

function to_decimal($deg, $min, $sec, $hem){
  $d = $deg + (($min/60) + ($sec/3600));
  return ($hem =='S' || $hem=='W') ?  $d*=-1 : $d;
}