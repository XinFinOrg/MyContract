/*
*
* MyContract
*
*/
// -----------------------------------------------------------------------------
// 1. GLOBAL CONSTANTS
// -----------------------------------------------------------------------------
(function(window, document, $, undefined) {
  "use strict";
  var MyContract = window.MyContract || (window.MyContract = {});
  if (Modernizr.touchevents) {
    MyContract.APP_TOUCH = true;
  } else {
    MyContract.APP_TOUCH = false;
  }
  MyContract.APP_MEDIAQUERY = {
    XLARGE: "1280px",
    LARGE: "992px",
    MEDIUM: "768px",
    SMALL: "576px",
    XSMALL: "0px"
  };
  MyContract.APP_COLORS = {
    primary: "#7468bd",
    secondary: "#8da6c3",
    accent: "#F64A91",
    info: "#42a4f4",
    warning: "#FFCE67",
    danger: "#ff5c75",
    success: "#2fbfa0",
    grey50: "#f0f6ff",
    grey100: "#dde9f5",
    grey200: "#cbdaea",
    grey300: "#b6cade",
    grey400: "#a4bad1",
    grey500: "#93acc6",
    grey600: "#839bb3",
    grey700: "#718599",
    grey800: "#617182",
    grey900: "#4d5a68"
  };

  // Option to persist settings
  // ----------------------------------
  var persistSettings = true;
  var $html = $("html"),
  $body = $("body");
  if (persistSettings) {
    //Setup some default layout options on app start.
    //Let's check if localStorage is available and persist our settings,
    if (typeof localStorage !== "undefined") {
      //Global namespace for sessionStorage,localStorage, and cookieStorage
      window.appConfig = Storages.initNamespaceStorage("appConfig");
    }
  }
  window.app = {
    persist: persistSettings,
    config: {
      isTouch: function isTouch() {
        return $html.hasClass("touch");
      }
    }
  };

  // debounce
  // --------------------
  window.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this,
      args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };



  // Switching theme color demo
  // ----------------------------------------

  $('[data-load-css]').on('click', function(e) {
    var element = $(this);
    if (element.is('a'))
    e.preventDefault();
    var uri = element.data('loadCss'),
    link;
    if (uri) {
      link = swapStyleSheet(uri);
      if (!link) {
        $.error('Error creating stylesheet link element.');
      }
    } else {
      $.error('No stylesheet location defined.');
    }
  });


  var swapStyleSheet = function(uri) {
    var linkId = 'autoloaded-stylesheet',
    oldLink = $('#' + linkId).attr('id', linkId + '-old');
    $('head').append($('<link/>').attr({
      'id': linkId,
      'rel': 'stylesheet',
      'href': uri
    }));
    if (oldLink.length) {
      oldLink.remove();
    }
    return $('#' + linkId);
  };



  var $openCtrl = $('#button-search'),
  $closeCtrl = $('#button-search-close'),
  $searchContainer = $('.fullpage-search-wrapper'),
  $inputSearch = $('.search__input');

  function init() {
    initEvents();
  }

  function initEvents() {

    $openCtrl.on('click', function() {
      openSearch();
    });
    $closeCtrl.on('click', function() {
      closeSearch();
    });
    $(document).on('keyup', function(ev) {
      // escape key.
      if (ev.keyCode == 27) {
        closeSearch();
      }
    });
  }

  function openSearch() {
    $searchContainer.addClass('search--open');
    $inputSearch.focus();
  }

  function closeSearch() {
    $searchContainer.removeClass('search--open');
    $inputSearch.blur();
    $inputSearch.val('');
  }

  init();

})(window, document, window.jQuery);

// -----------------------------------------------------------------------------
// 2. App Sidebars
// -----------------------------------------------------------------------------

(function(window, document, $, undefined) {
  "use strict";
  $(function() {
    // init sidebars
    // --------------------
    $(".nav.metismenu").metisMenu();
    // switch sidebar state mobile/desktop based on breakpoints
    // ----------------------------------------------------------
    var switchMenuState = function() {
      var $body = $("body"),
      $menuHeaderControls = $(".header-controls");
      if ($(window).width() < 992) {
        $body.removeClass("mini-sidebar");
        $menuHeaderControls.hide();
      } else if ($(window).width() > 992) {
        $body.removeClass("aside-left-open");
        $menuHeaderControls.show();
      }
    };
    $(window).on("resize", function() {
      debounce(switchMenuState, 300, false)();
    });
    // If sidebar is set to static
    // ------------------------------------------------
    if($("body.fixed-menu")){
      $("body.fixed-menu .main-menu").mCustomScrollbar({
        theme: "minimal-dark",
        scrollInertia: 100,
        setTop: "-999999px",
        mouseWheel: {
          preventDefault: true
        }
      });
    }

    // Toggle menu states
    // ----------------------------------
    var $toggleElement = $("[data-toggle-state]");
    $("[data-toggle-state]").on("click", function(e) {
      e.stopPropagation();
      var $body = $("body"),
      element = $(this),
      className = element.data("toggleState"),
      //key = element.data('key'),
      $target = $body;
      if (className) {
        if ($target.hasClass(className)) {
          $target.removeClass(className);
        } else {
          $target.addClass(className);
        }
      }
      menuIconState(className);
      backdropState(className);
    });

    // Toggle menu icon on Default Menu open/close
    // ----------------------------------
    var menuIconState = function(className) {
      if (className === "mini-sidebar") {
        if ($("body.mini-sidebar").length > 0) {
          $('[data-toggle-state="mini-sidebar"] > i')
          .removeClass("la-dot-circle-o")
          .addClass("la-circle");
        } else {
          $('[data-toggle-state="mini-sidebar"] > i')
          .removeClass("la-circle")
          .addClass("la-dot-circle-o");
        }
      }
    };
    // Load backdrop when sidebar is open
    // ----------------------------------
    var backdropState = function(className) {
      var backDrop =
      '<div class="aside-overlay-fixed" data-aos="fade-in" data-aos-duration="300"></div>';
      if (
        $("body.aside-right-open").length > 0 ||
        $("body.aside-left-open").length > 0 ||
        $("body.mail-compose-open").length > 0
      ) {
        $("body").append(backDrop);
        $(".aside-overlay-fixed").on("click", function() {
          $(this)
          .fadeOut("fast")
          .remove();
          $("body").removeClass(
            "aside-right-open aside-left-open mail-compose-open"
          );
        });
      }
    };
  });
})(window, document, window.jQuery);

// -----------------------------------------------------------------------------
// 3. General actions
// -----------------------------------------------------------------------------

(function(window, document, $, undefined) {
  "use strict";
  $(function() {
    $("[data-q-action]").on("click", function(e) {
      e.stopPropagation();
      var $this = $(this),
      action = $(this).data("q-action"),
      $card = $(this).parents(".card");

      switch (action) {
        /*-----------------------------------------------------------------------
        Site Search Open/Close
        -----------------------------------------------------------------------*/
        /**
        * Action: Open
        **/
        case "open-site-search":
        var $target = $(".top-toolbar.navbar-desktop .navbar-form");
        $target.find(".navbar-search").focus();
        $target.addClass("open");

        break;

        /**
        * Action: Close
        **/
        case "close-site-search":
        var $target = $(".top-toolbar .navbar-form");
        $target.find(".navbar-search").val("");
        $target.removeClass("open");

        break;

        /*-----------------------------------------------------------------------
        Notifications Open/Close Config
        -----------------------------------------------------------------------*/
        /**
        * Action: Open
        **/
        case "open-notifi-config":
        $this
        .children(".icon")
        .toggleClass("dripicons-gear dripicons-arrow-thin-left");
        $this.data("q-action", "close-notifi-config");
        var $target = $this
        .closest(".card")
        .find(".card-container-wrapper .card-container");

        $target.animate({
          left: "-300px"
        },
        400
      );

      break;

      /**
      * Action: Close
      **/
      case "close-notifi-config":
      $this
      .children(".icon")
      .toggleClass("dripicons-arrow-thin-left dripicons-gear");
      $this.data("q-action", "open-notifi-config");
      var $target = $this
      .closest(".card")
      .find(".card-container-wrapper .card-container");

      $target.animate({
        left: "0px"
      },
      400
    );

    break;

    /*-----------------------------------------------------------------------
    Template Page Sidebars
    -----------------------------------------------------------------------*/
    /**
    * Action: Open/Close
    **/
    case "page-aside-right-open":
    if (
      Modernizr.mq("(max-width: " + MyContract.APP_MEDIAQUERY.XLARGE + ")")
    ) {
      var $target = $(".aside-right"),
      $backdropTarget = $("body");

      $target.toggleClass("open");

      var addClickEvent = function() {
        $(".aside-overlay-fixed").on("touchend click", function(e) {
          $(this)
          .fadeOut("fast")
          .remove();
          $target.removeClass("open");
          return false;
        });
      };
      if ($target.hasClass("open")) {
        var backDrop =
        '<div class="aside-overlay-fixed" data-aos="fade-in" data-aos-duration="300"></div>';
        $backdropTarget.append(backDrop);
        addClickEvent();
      } else {
        $(".aside-overlay-fixed").trigger("click");
      }
    }

    break;

    /**
    * Action: Open/Close
    **/
    case "page-aside-left-open":
    if (Modernizr.mq("(max-width:992px)")) {
      var $target = $(".aside-left"),
      $backdropTarget = $("body");

      $target.toggleClass("open");

      var addClickEvent = function() {
        $(".aside-overlay-fixed").on("touchend click", function(e) {
          $(this)
          .fadeOut("fast")
          .remove();
          $target.removeClass("open");
          return false;
        });
      };

      if ($target.hasClass("open")) {
        var backDrop =
        '<div class="aside-overlay-fixed" data-aos="fade-in" data-aos-duration="300"></div>';
        $backdropTarget.append(backDrop);
        addClickEvent();
      } else {
        $(".aside-overlay-fixed").trigger("click");
      }
    }

    break;
  }
});
});
})(window, document, window.jQuery);


// -----------------------------------------------------------------------------
// 5. GLOBAL INIT SNIPPETS
// -----------------------------------------------------------------------------

(function(window, document, $, undefined) {
  "use strict";
  $(function() {
    // Smooth Scroll
    // ----------------------------------
    if ($('a.smooth-scroll[href*="#"]:not([href="#"])').length > 0) {
      $('a.smooth-scroll[href*="#"]:not([href="#"])').on('click',function() {
        if($(this).parents('ul').hasClass('doc-menu')){
          $('.doc-menu li').removeClass('active');
           $(this).parent('li').addClass('active')
        }

        if (
          location.pathname.replace(/^\//, "") ==
          this.pathname.replace(/^\//, "") &&
          location.hostname == this.hostname
        ) {
          var target = $(this.hash);
          target = target.length ?
          target :
          $("[name=" + this.hash.slice(1) + "]");
          if (target.length) {
            $("html, body").animate({
              scrollTop: target.offset().top - 75
            },500);
          return false;
        }
      }
    });
  }

  // Filter Toolbar Dropdown Menu
  // ----------------------------------
  if ($(".filter-input").length > 0) {
    var $filterInput = $(".filter-input"),
    $filterList = $("ul.filter-list li a.dropdown-item"),
    $clearList = $(".clear-filter");
    $clearList.hide();
    $filterInput.on("keyup", function() {
      var value = $(this)
      .val()
      .toLowerCase();
      $filterList.filter(function() {
        $(this).toggle(
          $(this)
          .text()
          .toLowerCase()
          .indexOf(value) > -1
        );
        $clearList.show();
        if (!$filterInput.val().length) {
          $clearList.hide();
        }
      });
    });

    $clearList.on("click", function() {
      $(this).hide();
      $filterInput.val("");
      $filterList.fadeIn();
    });
  }

  // Custom Scrollbar
  // ----------------------------------
  if ($("[data-scroll='minimal-dark']").length > 0 && $("[data-scroll='minimal-dark']").hasClass('scroll-bottom')) {
    $("[data-scroll='minimal-dark']").mCustomScrollbar({
      theme: "minimal-dark",
      scrollInertia: 100,
      setTop: "-999999px",
      mouseWheel: {
        preventDefault: true
      }
    });
  } else if ($("[data-scroll='minimal-dark']").length > 0) {
    $("[data-scroll='minimal-dark']").mCustomScrollbar({
      theme: "minimal-dark",
      scrollInertia: 100,
      mouseWheel: {
        preventDefault: true
      }
    });
  }
  if ($("[data-scroll='minimal']").length > 0) {
    $("[data-scroll='minimal']").mCustomScrollbar({
      theme: "minimal",
      scrollInertia: 100,
      mouseWheel: {
        preventDefault: true
      }
    });
  }
  if ($("[data-scroll='minimal-light']").length > 0) {
    $("[data-scroll='minimal-light']").mCustomScrollbar({
      theme: "minimal-light",
      scrollInertia: 100,
      mouseWheel: {
        preventDefault: true
      }
    });
  }
  // Modal Custom Scrollbar
  // ----------------------------------
  if ($('[data-modal="scroll"]').length > 0) {
    $('[data-modal="scroll"]').on("shown.bs.modal", function() {
      $(".modal-body").mCustomScrollbar({
        theme: "minimal-dark"
      });
    });
  }

  

  // Keep the dropdowns open when clicking switches
  // ------------------------------------------------
  if ($(".switchery").length > 0) {
    $(".switchery").on("click", function(e) {
      e.stopPropagation();
    });
  }

  // Dropdown menu animation
  // ------------------------------------------------
  if ($(".dropdown").length > 0) {
    $(".dropdown").on("hidden.bs.dropdown", function() {
      $(this)
      .find(".dropdown-menu")
      .removeAttr("style");
    });
  }
  // Reset Form
  // ------------------------------------------------
  $(".clear-form").on("click", function() {
    $(this)
    .closest("form")
    .find(":input")
    .val("");
    $(this)
    .closest("form")
    .find(":checkbox")
    .prop("checked", false);
    $(this)
    .closest("form")
    .find(":radio")
    .prop("checked", false);
  });
  

  // Auto Hide Menu Option for Horizontal Menu
  // ------------------------------------------------
  if ($("body.layout-horizontal.menu-auto-hide").length > 0) {
    // scroll is still position
    var scroll = $(document).scrollTop();
    var headerHeight = $('.header-bottom').outerHeight();
    //console.log(headerHeight);

    $(window).scroll(function() {
      // scrolled is new position just obtained
      var scrolled = $(document).scrollTop();

      // optionally emulate non-fixed positioning behaviour

      if (scrolled > headerHeight) {
        $('.header-bottom').addClass('off-canvas');
      } else {
        $('.header-bottom').removeClass('off-canvas');
      }

      if (scrolled > scroll) {
        // scrolling down
        $('.header-bottom').removeClass('fixed');
      } else {
        //scrolling up
        $('.header-bottom').addClass('fixed');
      }

      scroll = $(document).scrollTop();
    });
  }

  // File Upload - get file name to display
  // ------------------------------------------------
  $('.custom-file-input').on('change',function(){
       //get the file name
       var fileName = $(this).val().replace(/^.*\\/, "");
       //replace the "Choose a file" label
       $(this).next('.custom-file-label').html(fileName);
   });

});
})(window, document, window.jQuery);
