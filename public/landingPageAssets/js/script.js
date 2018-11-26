! function (a) {
	"use strict";
	var e = a(window),
		i = a("body"),
		l = a(".navbar");

	function t() {
		return e.width()
	}
	"ontouchstart" in document.documentElement || i.addClass("no-touch");
	var s = t();
	e.on("resize", function () {
		s = t()
	});
	var n = a(".is-sticky");
	if (n.length > 0) {
		var r = a("#mainnav").offset();
		e.scroll(function () {
			var a = e.scrollTop();
			(e.width() > 991 || n.hasClass("mobile-sticky")) && a > r.top ? n.hasClass("has-fixed") || n.addClass("has-fixed") : n.hasClass("has-fixed") && n.removeClass("has-fixed")
		})
	}
	a('a.menu-link[href*="#"]:not([href="#"])').on("click", function () {
		if (location.pathname.replace(/^\//, "") === this.pathname.replace(/^\//, "") && location.hostname === this.hostname) {
			var e = a(this.hash),
				i = !!this.hash.slice(1) && a("[name=" + this.hash.slice(1) + "]"),
				t = s >= 992 ? l.height() - 1 : 0;
			if ((e = e.length ? e : i).length) return a("html, body").animate({
				scrollTop: e.offset().top - t
			}, 1e3, "easeInOutExpo"), !1
		}
	});
	var o = window.location.href,
		d = o.split("#"),
		m = a(".nav li a");
	m.length > 0 && m.each(function () {
		o === this.href && "" !== d[1] && a(this).closest("li").addClass("active").parent().closest("li").addClass("active")
	});
	var c = a(".dropdown"),
		h = a(".dropdown-toggle");
	c.length > 0 && (c.on("mouseover", function () {
		e.width() > 991 && (a(this).children(".dropdown-menu").stop().fadeIn(400), a(this).addClass("open"))
	}), c.on("mouseleave", function () {
		e.width() > 991 && (a(this).children(".dropdown-menu").stop().fadeOut(400), a(this).removeClass("open"))
	}), h.on("click", function () {
		if (e.width() < 991) return a(this).parent().children(".dropdown-menu").fadeToggle(400), a(this).parent().toggleClass("open"), !1
	})), e.on("resize", function () {
		a(".navbar-collapse").removeClass("in"), c.parent().children(".dropdown-menu").fadeOut("400")
	});
	var p = a(".navbar-toggler"),
		v = a(".is-transparent");
	p.length > 0 && p.on("click", function () {
		a(".remove-animation").removeClass("animated"), v.hasClass("active") ? v.removeClass("active") : v.addClass("active")
	});
	var g = a("select");
	g.length > 0 && g.select2(), a(".menu-link").on("click", function () {
		a(".navbar-collapse").collapse("hide"), v.removeClass("active")
	}), a(document).on("mouseup", function (e) {
		v.is(e.target) || 0 !== v.has(e.target).length || (a(".navbar-collapse").collapse("hide"), v.removeClass("active"))
	});
	var u = a(".timeline-carousel");
	if (u.length > 0) {
		var f = !!i.hasClass("is-rtl");
		u.addClass("owl-carousel").owlCarousel({
			navText: ["<i class='ti ti-angle-left'></i>", "<i class='ti ti-angle-right'></i>"],
			items: 6,
			nav: !0,
			margin: 30,
			rtl: f,
			responsive: {
				0: {
					items: 1
				},
				400: {
					items: 2,
					center: !1
				},
				599: {
					items: 3
				},
				1024: {
					items: 5
				},
				1170: {
					items: 6
				}
			}
		})
	}
	var x = a(".roadmap-carousel");
	if (x.length > 0) {
		var b = !!i.hasClass("is-rtl");
		x.addClass("owl-carousel").owlCarousel({
			items: 6,
			nav: !1,
			dost: !0,
			margin: 30,
			rtl: b,
			responsive: {
				0: {
					items: 1
				},
				400: {
					items: 2,
					center: !1
				},
				599: {
					items: 3
				},
				1024: {
					items: 4
				},
				1170: {
					items: 5
				}
			}
		})
	}
	var w = a(".roadmap-carousel-withnav");
	if (w.length > 0) {
		var k = !!i.hasClass("is-rtl");
		w.addClass("owl-carousel").owlCarousel({
			navText: ["<i class='ti ti-angle-left'></i>", "<i class='ti ti-angle-right'></i>"],
			items: 5,
			nav: !0,
			dost: !1,
			margin: 30,
			rtl: k,
			responsive: {
				0: {
					items: 1
				},
				400: {
					items: 2,
					center: !1
				},
				599: {
					items: 3
				},
				1024: {
					items: 4
				},
				1170: {
					items: 5
				}
			}
		})
	}
	var C = a(".prblmsltn-list");
	if (C.length > 0) {
		var y = !!i.hasClass("is-rtl");
		C.addClass("owl-carousel").owlCarousel({
			navText: ["<i class='fas fa-arrow-left'></i>", "<i class='fas fa-arrow-right'></i>"],
			items: 1,
			margin: 30,
			nav: !0,
			dost: !1,
			autoplay: !0,
			loop: !0,
			animateOut: "fadeOut",
			autoHeight: !0,
			rtl: y
		})
	}
	var z = a(".has-carousel");
	if (z.length > 0) {
		var A = !!i.hasClass("is-rtl");
		z.each(function () {
			var e = a(this),
				i = e.data("items") ? e.data("items") : 4,
				l = i >= 3 ? 2 : i,
				t = l >= 2 ? 1 : l,
				s = e.data("delay") ? e.data("delay") : 6e3,
				n = !!e.data("auto"),
				r = !!e.data("loop"),
				o = !!e.data("dots"),
				d = !!e.data("navs"),
				m = !!e.data("center"),
				c = e.data("margin") ? e.data("margin") : 30;
			e.addClass("owl-carousel").owlCarousel({
				navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
				items: i,
				loop: r,
				nav: d,
				dots: o,
				margin: c,
				center: m,
				autoplay: n,
				autoplayTimeout: s,
				autoplaySpeed: 300,
				rtl: A,
				responsive: {
					0: {
						items: 1
					},
					480: {
						items: t
					},
					768: {
						items: l
					},
					1170: {
						items: i
					}
				}
			})
		})
	}
	var P = a(".token-countdown");
	P.length > 0 && P.each(function () {
		var e = a(this),
			i = e.attr("data-date");
		e.countdown(i).on("update.countdown", function (e) {
			a(this).html(e.strftime('<div class="col"><span class="countdown-time countdown-time-first">%D</span><span class="countdown-text">D<span>ays</span></span></div><div class="col"><span class="countdown-time">%H</span><span class="countdown-text">H<span>ours</span></span></div><div class="col"><span class="countdown-time">%M</span><span class="countdown-text">M<span>inutes<span></span></div><div class="col"><span class="countdown-time countdown-time-last">%S</span><span class="countdown-text">S<span>econds</span></span></div>'))
		})
	});
	var D = a(".countdown-s2");
	D.length > 0 && D.each(function () {
		var e = a(this),
			i = e.attr("data-date");
		e.countdown(i).on("update.countdown", function (e) {
			a(this).html(e.strftime('<div class="countdown-s2-item"><span class="countdown-s2-time countdown-time-first">%D</span><span class="countdown-s2-text">Days</span></div><div class="countdown-s2-item"><span class="countdown-s2-time">%H</span><span class="countdown-s2-text">Hours</span></div><div class="countdown-s2-item"><span class="countdown-s2-time">%M</span><span class="countdown-s2-text">Min</span></div><div class="countdown-s2-item"><span class="countdown-s2-time countdown-time-last">%S</span><span class="countdown-s2-text">Sec</span></div>'))
		})
	});
	var j = a(".content-popup");
	j.length > 0 && j.magnificPopup({
		type: "inline",
		preloader: !0,
		removalDelay: 400,
		mainClass: "mfp-fade bg-team-exp"
	});
	var L = a(".video-play");
	L.length > 0 && L.magnificPopup({
		type: "iframe",
		removalDelay: 160,
		preloader: !0,
		fixedContentPos: !1,
		callbacks: {
			beforeOpen: function () {
				this.st.image.markup = this.st.image.markup.replace("mfp-figure", "mfp-figure mfp-with-anim"), this.st.mainClass = this.st.el.attr("data-effect")
			}
		}
	});
	var S = a(".imagebg");
	S.length > 0 && S.each(function () {
		var e = a(this),
			i = e.parent(),
			l = e.data("overlay"),
			t = e.children("img").attr("src"),
			s = void 0 !== l && "" !== l && l.split("-");
		void 0 !== t && "" !== t && (i.hasClass("has-bg-image") || i.addClass("has-bg-image"), "" !== s && "dark" === s[0] && (i.hasClass("light") || i.addClass("light")), e.css("background-image", 'url("' + t + '")').addClass("bg-image-loaded"))
	});
	
	var _ = a(".promo-trigger"),
		H = a(".promo-content"),
		V = a(".promo-close");
	V.length > 0 && V.on("click", function () {
		var a = Cookies.get("twz-offer");
		return H.removeClass("active"), _.addClass("active"), null == a && Cookies.set("twz-offer", "true", {
			expires: 1,
			path: ""
		}), !1
	}), e.on("load", function () {
		null == Cookies.get("twz-offer") ? H.addClass("active") : _.addClass("active")
	});
	var U = a("#contact-form"),
		B = a("#subscribe-form");
	if (U.length > 0 || B.length > 0) {
		if (!a().validate || !a().ajaxSubmit) return console.log("contactForm: jQuery Form or Form Validate not Defined."), !0;
		if (U.length > 0) {
			var O = U.find("select.required"),
				F = U.find(".form-results");
			U.validate({
				invalidHandler: function () {
					F.slideUp(400)
				},
				submitHandler: function (e) {
					F.slideUp(400), a(e).ajaxSubmit({
						target: F,
						dataType: "json",
						success: function (i) {
							var l = "error" === i.result ? "alert-danger" : "alert-success";
							F.removeClass("alert-danger alert-success").addClass("alert " + l).html(i.message).slideDown(400), "error" !== i.result && a(e).clearForm().find(".input-field").removeClass("input-focused")
						}
					})
				}
			}), O.on("change", function () {
				a(this).valid()
			})
		}
		if (B.length > 0) {
			var M = B.find(".subscribe-results");
			B.validate({
				invalidHandler: function () {
					M.slideUp(400)
				},
				submitHandler: function (e) {
					M.slideUp(400), a(e).ajaxSubmit({
						target: M,
						dataType: "json",
						success: function (i) {
							var l = "error" === i.result ? "alert-danger" : "alert-success";
							M.removeClass("alert-danger alert-success").addClass("alert " + l).html(i.message).slideDown(400), "error" !== i.result && a(e).clearForm()
						}
					})
				}
			})
		}
	}
	var K = a(".input-line");
	K.length > 0 && K.each(function () {
		var e = a(this);
		a(this).val().length > 0 && e.parent().addClass("input-focused"), e.on("focus", function () {
			e.parent().addClass("input-focused")
		}), e.on("blur", function () {
			e.parent().removeClass("input-focused"), a(this).val().length > 0 && e.parent().addClass("input-focused")
		})
	});
	var Q = a(".animated");
	a().waypoint && Q.length > 0 && e.on("load", function () {
		Q.each(function () {
			var e = a(this),
				i = e.data("animate"),
				l = e.data("duration"),
				t = e.data("delay");
			e.waypoint(function () {
				e.addClass("animated " + i).css("visibility", "visible"), l && e.css("animation-duration", l + "s"), t && e.css("animation-delay", t + "s")
			}, {
				offset: "93%"
			})
		})
	});
	var W = a("#preloader"),
		X = a("#loader");
	W.length > 0 && e.on("load", function () {
		X.fadeOut(300), i.addClass("loaded"), W.delay(700).fadeOut(300)
	});
	var q = ".slider-pane";
	if (a(q).length > 0) {
		var G = !!i.hasClass("is-rtl");
		a(q).addClass("owl-carousel").owlCarousel({
			items: 1,
			nav: !1,
			dotsContainer: ".slider-nav,.slider-dot",
			margin: 30,
			loop: !0,
			autoplayTimeout: 3e3,
			rtl: G,
			autoplay: !0,
			animateOut: "fadeOut",
			autoplayHoverPause: !0
		})
	}
	var Z = a(".card");
	Z.length > 0 && Z.each(function () {
		a(".card-header a").on("click", function () {
			var e = a(this);
			e.parent().parent().parent().parent().find(Z).removeClass("active"), e.parent().parent().parent().addClass("active")
		})
	});
	var $ = a("#particles-js"),
		aa = "#2b56f5",
		ea = "#00c0fa";
	i.hasClass("io-zinnia") && (aa = "#fff", ea = "#fff"), $.length > 0 && particlesJS("particles-js", {
		particles: {
			number: {
				value: 30,
				density: {
					enable: !0,
					value_area: 800
				}
			},
			color: {
				value: ea
			},
			shape: {
				type: "circle",
				opacity: .2,
				stroke: {
					width: 0,
					color: aa
				},
				polygon: {
					nb_sides: 5
				},
				image: {
					src: "img/github.svg",
					width: 100,
					height: 100
				}
			},
			opacity: {
				value: .3,
				random: !1,
				anim: {
					enable: !1,
					speed: 1,
					opacity_min: .12,
					sync: !1
				}
			},
			size: {
				value: 6,
				random: !0,
				anim: {
					enable: !1,
					speed: 40,
					size_min: .08,
					sync: !1
				}
			},
			line_linked: {
				enable: !0,
				distance: 150,
				color: aa,
				opacity: .5,
				width: 1.3
			},
			move: {
				enable: !0,
				speed: 6,
				direction: "none",
				random: !1,
				straight: !1,
				out_mode: "out",
				bounce: !1,
				attract: {
					enable: !1,
					rotateX: 600,
					rotateY: 1200
				}
			}
		},
		interactivity: {
			detect_on: "canvas",
			events: {
				onhover: {
					enable: !0,
					mode: "repulse"
				},
				onclick: {
					enable: !0,
					mode: "push"
				},
				resize: !0
			},
			modes: {
				grab: {
					distance: 400,
					line_linked: {
						opacity: 1
					}
				},
				bubble: {
					distance: 400,
					size: 40,
					duration: 2,
					opacity: 8,
					speed: 3
				},
				repulse: {
					distance: 200,
					duration: .4
				},
				push: {
					particles_nb: 4
				},
				remove: {
					particles_nb: 2
				}
			}
		},
		retina_detect: !0
	})
}(jQuery);