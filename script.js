(function($) {
  var slideIndex = 1;
  var PIXELS_PER_SECOND = 608;
  var MAIN_CONTENT_WIDTH = 1024;
  var currentlyRunning = false;
  var firstTimeRunning = true;
    
  var $sliderContainer = $('#slider-window');
  var $imageList = $sliderContainer.find('ul').eq(0);
  var $imageListItems = $imageList.find('li');
  var $slide = $imageListItems.eq(0);
  var slideLen = $imageListItems.length;
  
  var autoScrollIntervalID;
  var resizeTimeoutID;
  var restartSliderTimeoutID;

  //initially hide slider
  $imageList.css({ "opacity" : 0 }); //cannot use hide() as it removes it from DOM

  function positionSlider( initial=false ) {
    var slideWidth = $slide.outerWidth(true); //includes padding-right, but CSS media query removes this when in mobile view
    var sliderHeight = $slide.outerHeight(true);      
    var imageWidth = $slide.width(); //image width without padding-right
      
    var sliderOffset;
    var slidersLeftPosition;
    var browserWidth = $(window).width(); //get width of browser's viewport
    var distanceToMiddle = (browserWidth - imageWidth) / 2; //slideWidth
    
    //adjust height of slider #slider-window
    $sliderContainer.css( "height", sliderHeight );
      
    //Difference in slider positioning
    function calculateSliderOffset() {
      var offset;

      //Desktop
      if( browserWidth >= MAIN_CONTENT_WIDTH ) {
        offset = -((slideWidth * slideIndex) - distanceToMiddle);
      } else {
        //Mobile
        offset = -(slideWidth * slideIndex);
      }

      return offset;
    }

    //When you reach the clone of first slide (ie. the next index points to the end of the slide which is the clone of the second slide), 
    //change the slider index position back to the first original slide (which is at the second index).
    //Then move it to that position instantly, so the image slider rewinds without the user noticing.
    //Then, increase the next index to point to the next slide in turn (which is the original second slide), so when it next slide animates, it will make a continuous loop.
    if( slideIndex == slideLen + 2 ){
      slideIndex = 1;
      sliderOffset = calculateSliderOffset();
      
      //instantly move slider position to the copy of last slide
      // can't use animate( {"left" : sliderOffset + "px"}, 0 ) as its delayed
      $imageList.css( {"left" : sliderOffset + "px"} );    

      //increase index to point to next slide, so when animate next runs, it will continue sliding.
      slideIndex++;      
    }

    sliderOffset = calculateSliderOffset();

    //Animate to next slide
    if(initial) {
      //move into position straight away
      $imageList.css( {"left" : sliderOffset + "px"} );        
    } else {      
      slidersLeftPosition = parseInt( $imageList.css("left") );

      //error checking
      if( isNaN(slidersLeftPosition) ){
        slidersLeftPosition = 0;
      }

      var distanceToMove = Math.abs(sliderOffset - slidersLeftPosition);
      var timeToGetThere = 750 * (distanceToMove / PIXELS_PER_SECOND).toFixed(2);

      $imageList.animate( {"left" : sliderOffset + "px"}, timeToGetThere ); //move into position with animation      
    }
  }

  function buildSlider() {
    var $cloneOfFirst = $imageListItems.eq(0).clone();
    var $cloneOfSecond = $imageListItems.eq(1).clone();
    var $cloneOfLast = $imageListItems.eq(slideLen - 1).clone();
    
    $imageList.append($cloneOfFirst, $cloneOfSecond).prepend($cloneOfLast);  

    positionSlider(true);

    //show slider
    $imageList.animate({ "opacity" : 1 }, 600);
  }

  function offsetSlider() {
    slideIndex++;
    positionSlider();
  }

  function startSlider() {
    //check if already running before starting it again
    if(currentlyRunning===false) {
      currentlyRunning = true;

      //initially slide once
      offsetSlider();

      //then, set automated slide
      autoScrollIntervalID = setInterval( function() {
        offsetSlider(); },
        5000 //perform every x seconds
      );
    }
  }

  function stopSlider() {
    currentlyRunning = false;
    clearTimeout(restartSliderTimeoutID);
    clearInterval(autoScrollIntervalID);
  }

  //wait until document has loaded images
  $(window).on("load", function() {
    buildSlider();
      
    //start slider only once user has scrolled down so that the full-height of slider is visible      
    $(window).scroll(function() {
       var sliderTopPos = $imageList.offset().top;
       var sliderHeight = $imageList.outerHeight();
       var windowHeight = $(window).height();
       var windowTopPos = $(this).scrollTop();    

       //if( windowTopPos >= (sliderTopPos - windowHeight) && firstTimeRunning===true && currentlyRunning==false ){
       if( windowTopPos >= (sliderTopPos + sliderHeight - windowHeight) && firstTimeRunning===true && currentlyRunning==false ){
           firstTimeRunning = false;   
           
           //start slider
           restartSliderTimeoutID = setTimeout(startSlider, 1000);           
       }
    });  
      
    //user event handlers

    //on resize browser, position slider again  //$(window).on("resize", positionSlider);    
    //delay call to positionSlider using setTimeout, as resize event occurs multiple times while resizing.
    $(window).resize( function() {
      clearTimeout(resizeTimeoutID);
      resizeTimeoutID = setTimeout(positionSlider, 250); 
    });
    
    $imageList.on("mouseover", function() {
      stopSlider();
    });

    $imageList.on("mouseout", function() {
      restartSliderTimeoutID = setTimeout(startSlider, 500);
    });
  });

})(jQuery);
