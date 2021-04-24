/*-----------------------------------------------------------------------------------
/*
/* Init JS
/*
-----------------------------------------------------------------------------------*/
// function trackHrefAsEvent(hrefitem) {
//   myhref = $(this).attr('href')
//   if (myhref.endsWith("pdf")) {
//     alert("download: " + myhref)  
//   } else if (myhref.startsWith("http")) {
//     alert("external: " + myhref) 
//   } else if (myhref.startsWith("#")) {
//     alert("pageview: " + myhref)
//   } else if (myhref.startsWith("tel:")) {
//     alert("tel: " + myhref) 
//   } else if (myhref.startsWith("mailto:")) {
//     alert("mailto: " + myhref) 
//   }
// }

var currentYear = parseInt((new Date()).getFullYear());
var currentYearMinusOne = currentYear - 1;
var mostRecentYear = currentYear;
var currentMonth = parseInt((new Date()).getMonth());
var monthBeforeWhichToShowPreviousYear = 4; // if before April, then show previous year in pubs and talks


function smoothScrollFunction(e) {
  e.preventDefault();

  var target = this.hash,
  $target = $(target);

  $('html, body').stop().animate({
      'scrollTop': $target.offset().top
  }, 800, 'swing', function () {
      window.location.hash = target;
  });
}


function setYearHighlightsAndCounts() {
    // hide year headers that have no entries visible
    $('.pubheader').show(); // first show all!
    $('.pubheader').each( function () {
        var n = $(this).nextAll(":visible:first");
        if ((n.size() == 0) || n.first().attr('class').match("pubheader")) {
            $(this).hide();
        } else {
            $(this).show();
        }
    // set pubcount to visible ones
    $("#pubcount").html($('.pubentry:visible').size().toString() + "/" + $('.pubentry').size().toString());
    });
}


var talkYearFirstToShow = (currentMonth < monthBeforeWhichToShowPreviousYear) ? currentYearMinusOne - 1 : currentYearMinusOne;
function setTalkVisibility() {
      $('.talkentry').each( function () {
      var talkyearclass = this.className.match(/talkyear[0-9]+/);
      if (talkyearclass) {
          var hide = true;
          for (var i = 0; i < talkyearclass.length; ++i) {
              var talkyear = parseInt(talkyearclass[i].substring("talkyear".length), 10);
              if (talkyear >= talkYearFirstToShow) {
                  hide = false;
              }
          }
          if (hide) {
                $(this).hide();
          }
      }
    });
}


function setSmoothScrollOnSection(sectionid) {
    // thanks a million: https://stackoverflow.com/questions/15090942/event-handler-not-working-on-dynamic-content
    $(sectionid).on('click', '.smoothscroll', smoothScrollFunction)
}


function initTalkSection() {
/*----------------------------------------------------*/
/*  talks selection/search
------------------------------------------------------*/
    $('#moretalks').click( function () {
      $('.talkentry:hidden').show();
      $(this).hide();
    });
    
    setTalkVisibility();

    setSmoothScrollOnSection("#talks");
}


function initPubSection() {
/*----------------------------------------------------*/
/*  publication selection/search
------------------------------------------------------*/
  $('#pubfilter').keyup(function (e) { // keyup to also catch backspace!
      var key = e.which;
    // If we already had typed text and searched before,
    // then #pubsearch will be "Clear". But we still want
    // to search, so we first change it back to "Search"
      if ((key != 32) && $(this).val().trim().length > 0) { // not a space, and non-empty
        $('#pubsearch').text("Search");
      }

    if (key == 13) { // the enter key code
        // Behave as we pressed the Search button
        $('#pubsearch').click();
        return false;  
      }
  }); // end $(#pubfilter).keyup

  //----------------  

  $('span.pub-classes').click(function() {
      var year = null;
      var type = null;
      var field = null;
      
      if (this.className.match("year")) {
          $('.pub-classes.year').removeClass("current");
          $(this).addClass("current");
      } else if (this.className.match("field")) {
          $('.pub-classes.field').removeClass("current");
          $(this).addClass("current");
      } else if (this.className.match("type")) {
          $('.pub-classes.type').removeClass("current");
          $(this).addClass("current");
      } else if (this.className.match("search")) {
          if ($('#pubsearch').text() == "Clear") {
                $('#pubfilter').val("");
                $(this).text("Search");
          } else {
                $(this).text("Clear");
          }
      }
      
      $('.pub-classes.year.current').each( function () {
            // we may have multiple years selected initially,
            // so make sure we only keep one (the lowest one)
            $('.pub-classes.year').removeClass("current");
            $(this).addClass("current");
          year = this.innerHTML;
      });
      $('.pub-classes.type.current').each( function () {
          if (type != null) 
          alert("Error: multiple types selected!");
          type = this.innerHTML;
      });
      $('.pub-classes.field.current').each( function () {
          if (field != null) 
                alert("Error: multiple fields selected!");
          field = this.innerHTML;
      });
      
      var textfilter = $('#pubfilter').val();
      if (textfilter == "") {
          textfilter = null;
      }
      
      if (year == "All") {
          year = null;
      } else {
          year = "pub" + year;
      }

      switch (type) {
      case "All": type = null; break;
      case "Journal Article": type = "pubarticle"; break;
      case "Conference Paper": type = "pubinproceedings"; break;
      case "Book Chapter": type = "pubinbook"; break;
      }

      switch (field) {
      case "All": field = null; break;
      case "IR/IE": field = "pubir"; break;
      case "Text-to-knowledge": field = "pubir"; break;
      case "Smart Grid": field = "pubsmartgrid"; break;
      case "Optical Networks": field = "puboptical"; break;
      case "Multimedia": field = "pubmedia"; break;
      }

      var searchExpr = new Array();
      if (textfilter != null) {
          try {
            var searchTerms = textfilter.match(/\S+/g);
            for (var i = 0; i < searchTerms.length; i++){
                if (searchTerms[i]) {
                  searchExpr[i] = new RegExp(searchTerms[i], "i");
                }
            }
          } catch (err) {
            if (window.console != null){
              window.console.error("Search Error: %s", err);
            }
            textfilter = null;
          }
      }

      if ((year != null) || (field != null) || (type != null) || (textfilter != null)) {
          // first hide everything
          $('.pubentry').hide();
          // show the ones we want
          $('.pubentry').each(function (i, e) {
              var show = true;
              var searchTerms = new Array();
              if ((year != null) && !this.className.match(year)) {
                  show = false;
              }
              if ((type != null) && !this.className.match(type)) {
                  show = false;
              }
              if ((field != null) && !this.className.match(field)) {
                  show = false;
              }
              if (!this.className.match("pubheader") && (textfilter != null)) {
                var str = $(this).text();
                var found = true;
                for (var i = 0; i < searchExpr.length; ++i){
                  if (str.search(searchExpr[i]) == -1){
                      found = false;
                      break;
                  }
                }
                if (!found) {
                  show = false;
                }
              }
              if (show) {
                  $(this).show();
              }
          });
      } else {
          $('.pubentry').show();
      }
      setYearHighlightsAndCounts()
  }); // end $('span.pub-classes').click

    // Search button: toggle between 'Search' and 'Clear'
 //    $('#pubfilter').keyup(function () {
  // if ($(this).val().trim().length > 0) {
  //     $('#pubsearch').text("Search");
  // } else {
  //      $('#pubsearch').text("Clear");
  //  }
 //    });

  // Add year header before every 1st publication entry of a certain year
  for (var i = 2010; i <= currentYear + 1; ++i) {
    var y = i.toString();
    $('.pub' + y + ':first').before('<div class="row pubheader"><div class="twelve columns"><h4>' + y + '</h4></div></div>');
    if ($('.pub' + y)[0]) {
      mostRecentYear = y;
    }
  }
  
  // Only show publications of most recent year ...
  $('span.pub-classes.year').each(function () {
    var filterYear = parseInt($(this).text());
    if (filterYear == mostRecentYear) {
       $(this).triggerHandler("click");
    }
    // // Alternative: show all?
    // var filterYear = $(this).text();
    // if (filterYear == "All") {
    //   $(this).triggerHandler("click");
    // }
  });
  
  // ... and the next year(s) also, if any!
  $('span.pub-classes.year').each(function () {
      var futureYear = parseInt($(this).text());
      if (futureYear > currentYear) {
          pubYear = "pub" + futureYear;
          $('.pubentry').each(function (i, e) {
              if (this.className.match(pubYear))
                  $(this).show();
          });
          setYearHighlightsAndCounts();
          $(this).addClass("current"); // highlight future year button
          // TODO(chris) highlight year button!
      }
  });

  // ... and if we're in Jan/Feb/March, still show past year as well
  $('span.pub-classes.year').each(function () {
      var futureYear = parseInt($(this).text());
      if (futureYear > currentYear) {
          pubYear = "pub" + futureYear;
          $('.pubentry').each(function (i, e) {
              if (this.className.match(pubYear))
                  $(this).show();
          });
          setYearHighlightsAndCounts();
          $(this).addClass("current"); // highlight future year buttons
      }
      if (currentMonth < monthBeforeWhichToShowPreviousYear) { // Jan/Feb/March -> show past year as well
        pubYear = "pub" + currentYearMinusOne;
          $('.pubentry').each(function (i, e) {
              if (this.className.match(pubYear))
                  $(this).show();
          });
          setYearHighlightsAndCounts();
          $('span.pub-classes.year').filter(function() { return ($(this).text().indexOf(currentYearMinusOne.toString()) > -1) }).addClass("current");
      }
  });


    // We already set pubcount field ;-)
    // $("#pubcount").html($('div[class*=pubentry]:visible').size().toString() + "/" + $('div[class*=pubentry]').size().toString());

/*----------------------------------------------------*/
/*  publication details (BibTeX and Abstract)
------------------------------------------------------*/
     
 $('.popup-with-zoom-anim').magnificPopup({
     type: 'inline',

     fixedContentPos: false,
     fixedBgPos: true,

     overflowY: 'auto',

     closeBtnInside: true,
     preloader: false,
     
     midClick: true,
     removalDelay: 200,
     mainClass: 'my-mfp-zoom-in'
 });

 setSmoothScrollOnSection("#publications");

} // end initPubSection

jQuery(document).ready(function($) {

/*----------------------------------------------------*/
/* Avoid caching .load() content -- thanks much http://blog.akinyeleolubodun.com/jquery-.load-not-working-solved.html
/* alternatives here: https://hungred.com/how-to/tutorial-stop-caching-jquery-javascript/
------------------------------------------------------ */
   $.ajaxSetup({ cache: false });

/*----------------------------------------------------*/
/* FitText Settings
------------------------------------------------------ */

    setTimeout(function() {
	   $('h1.responsive-headline').fitText(1, { minFontSize: '20px', maxFontSize: '50px' });
	 }, 100);


/*----------------------------------------------------*/
/* Smooth Scrolling
------------------------------------------------------ */
  $('.smoothscroll').on('click', smoothScrollFunction);


/*----------------------------------------------------*/
/* Highlight the current section in the navigation bar
------------------------------------------------------*/

	var sections = $("section");
	var navigation_links = $("#nav-wrap a");

	sections.waypoint({

      handler: function(event, direction) {

		   var active_section;

			active_section = $(this);
			if (direction === "up") active_section = active_section.prev();

			var active_link = $('#nav-wrap a[href="#' + active_section.attr("id") + '"]');

         navigation_links.parent().removeClass("current");
			active_link.parent().addClass("current");

		},
		offset: '35%'

	});


/*----------------------------------------------------*/
/*	Make sure that #header-background-image height is
/* equal to the browser height.
------------------------------------------------------ */

   $('header').css({ 'height': $(window).height() });
   $('section#about').css({ 'min-height': $(window).height() });
   $(window).on('resize', function() {

        $('header').css({ 'height': $(window).height() });
        $('section#about').css({ 'min-height': $(window).height() });
        $('body').css({ 'width': $(window).width() })
   });


/*----------------------------------------------------*/
/*	Fade In/Out Primary Navigation
------------------------------------------------------*/

   $(window).on('scroll', function() {

		var h = $('header').height();
		var y = $(window).scrollTop();
      var nav = $('#nav-wrap');

	   if ( (y > h*.20) && (y < h) && ($(window).outerWidth() > 768 ) ) {
	      nav.fadeOut('fast');
	   }
      else {
         if (y < h*.20) {
            nav.removeClass('opaque').fadeIn('fast');
         }
         else {
            nav.addClass('opaque').fadeIn('fast');
         }
      }

	});


/*----------------------------------------------------*/
/*	Modal Popup
------------------------------------------------------*/

    $('.item-wrap a').magnificPopup({

       type:'inline',
       fixedContentPos: false,
       removalDelay: 200,
       showCloseBtn: false,
       mainClass: 'mfp-fade'

    });

    $(document).on('click', '.popup-modal-dismiss', function (e) {
    		e.preventDefault();
    		$.magnificPopup.close();
    });


/*----------------------------------------------------*/
/*	Flexslider
/*----------------------------------------------------*/
   $('.flexslider').flexslider({
      namespace: "flex-",
      controlsContainer: ".flex-container",
      animation: 'slide',
      controlNav: true,
      directionNav: false,
      smoothHeight: true,
      slideshowSpeed: 7000,
      animationSpeed: 600,
      randomize: false,
   });

});
