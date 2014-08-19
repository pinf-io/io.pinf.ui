
define(function() {

	return function() {
		var self = this;

		return self.hook(
			{
				"htm": "./" + self.widget.id + ".htm"
			},
			{},
			[
				{
					resources: [ "htm" ],
					handler: function(_htm) {

						return self.setHTM(_htm).then(function() {

							var HELPERS = window.API.helpers;
				            var Q = HELPERS.API.Q;


							//Enable sidebar toggle
						    $("[data-toggle='offcanvas']").click(function(e) {
						        e.preventDefault();

						        //If window is small enough, enable sidebar push menu
						        if ($(window).width() <= 992) {
						            $('.row-offcanvas').toggleClass('active');
						            $('.left-side').removeClass("collapse-left");
						            $(".right-side").removeClass("strech");
						            $('.row-offcanvas').toggleClass("relative");
						        } else {
						            //Else, enable content streching
						            $('.left-side').toggleClass("collapse-left");
						            $(".right-side").toggleClass("strech");
						        }
						    });

						    //Add hover support for touch devices
						    $('.btn').bind('touchstart', function() {
						        $(this).addClass('hover');
						    }).bind('touchend', function() {
						        $(this).removeClass('hover');
						    });

						    //Activate tooltips
//						    $("[data-toggle='tooltip']").tooltip();

						    /*     
						     * Add collapse and remove events to boxes
						     */
						    $("[data-widget='collapse']").click(function() {
						        //Find the box parent        
						        var box = $(this).parents(".box").first();
						        //Find the body and the footer
						        var bf = box.find(".box-body, .box-footer");
						        if (!box.hasClass("collapsed-box")) {
						            box.addClass("collapsed-box");
						            bf.slideUp();
						        } else {
						            box.removeClass("collapsed-box");
						            bf.slideDown();
						        }
						    });

						    /*
						     * ADD SLIMSCROLL TO THE TOP NAV DROPDOWNS
						     * ---------------------------------------
						     */
						    $(".navbar .menu").slimscroll({
						        height: "200px",
						        alwaysVisible: false,
						        size: "3px"
						    }).css("width", "100%");

						    /*
						     * INITIALIZE BUTTON TOGGLE
						     * ------------------------
						     */
						    $('.btn-group[data-toggle="btn-toggle"]').each(function() {
						        var group = $(this);
						        $(this).find(".btn").click(function(e) {
						            group.find(".btn.active").removeClass("active");
						            $(this).addClass("active");
						            e.preventDefault();
						        });

						    });

						    $("[data-widget='remove']").click(function() {
						        //Find the box parent        
						        var box = $(this).parents(".box").first();
						        box.slideUp();
						    });

						    /* Sidebar tree view */
						    //$(".sidebar .treeview").tree();

						    /* 
						     * Make sure that the sidebar is streched full height
						     * ---------------------------------------------
						     * We are gonna assign a min-height value every time the
						     * wrapper gets resized and upon page load. We will use
						     * Ben Alman's method for detecting the resize event.
						     * 
						     **/
						    function _fix() {
						        //Get window height and the wrapper height
						        var height = $(window).height() - $("body > .header").height();
						        $(".wrapper").css("min-height", height + "px");
						        var content = $(".wrapper").height();
						        //If the wrapper height is greater than the window
						        if (content > height)
						            //then set sidebar height to the wrapper
						            $(".left-side, html, body").css("min-height", content + "px");
						        else {
						            //Otherwise, set the sidebar to the height of the window
						            $(".left-side, html, body").css("min-height", height + "px");
						        }
						    }
						    //Fire upon load
						    _fix();

							function fix_sidebar() {
							    //Make sure the body tag has the .fixed class
							    if (!$("body").hasClass("fixed")) {
							        return;
							    }

							    //Add slimscroll
							    $(".sidebar").slimscroll({
							        height: ($(window).height() - $(".header").height()) + "px",
							        color: "rgba(0,0,0,0.2)"
							    });
							}
						    //Fire when wrapper is resized
						    $(".wrapper").resize(function() {
						        _fix();
						        fix_sidebar();
						    });

						    //Fix the fixed layout sidebar scroll bug
						    fix_sidebar();

						    /*
						     * We are gonna initialize all checkbox and radio inputs to 
						     * iCheck plugin in.
						     * You can find the documentation at http://fronteed.com/iCheck/
						     */
						    /*
						    $("input[type='checkbox'], input[type='radio']").iCheck({
						        checkboxClass: 'icheckbox_minimal',
						        radioClass: 'iradio_minimal'
						    });
							*/



				            /**
				             * Views
				             */
				            var views = Q.nbind(window.API.load.static, null)("sammy").then(function(SAMMY) {
				                var sammy = null;
				                return Q.denodeify(function (callback) {
				                    sammy = SAMMY(function() {
				                        return HELPERS.getViews().then(function(views) {
				                            var activeView = null;
				                            var latestWidgets = [];
				                            Object.keys(views).forEach(function(routeExpr) {
				                                var view = views[routeExpr];
				                                var canShow = true;
				                                // TODO: Reverse this. Only show if authorized and do this check on server.
				                                if (typeof view.clearance !== "undefined") {
				                                	canShow = false;
				                                	view.clearance.forEach(function (role) {
				                                		if (canShow) return;
				                                		if (window.API.authorizedRoles.indexOf(role) !== -1) {
				                                			canShow = true;
				                                		}
				                                	})
				                                }
				                                if (!canShow) return;
				                                var route = routeExpr;
				                                if (/^\/.+\/$/.test(routeExpr)) {
				                                    routeExpr = new RegExp(route.replace(/(^\/|\/$)/g, ""));
				                                    route = view.link;
				                                }
				                                console.log("Register view", route, view);
				                                if (view.aspects) {
				                                    if (view.aspects["sidebar-menu-container"]) {
				                                        var html = [];
				                                        html.push('<li>');
				                                        html.push('<a href="' + route + '">');
				                                        html.push('<i class="fa ' + view.aspects["sidebar-menu-container"].style + '"></i> <span>' + view.aspects["sidebar-menu-container"].label + '</span>');
				                                        html.push('</a>');
				                                        html.push('</li>');
				                                        $(html.join("")).appendTo($("#sidebar-menu-container"));
				                                    }
				                                }
				                                return sammy.get(routeExpr, function() {
				                                    if (activeView === route) {
				                                        // If view has not changed we don't reload it.
				                                        // TODO: Optionally force-reload view.
				                                        return;
				                                    }
				                                    activeView = route;
				                                    console.log("Show view", route, view);
				                                    if (latestWidgets) {
				                                        while (latestWidgets.length > 0) {
				                                            latestWidgets.shift().destroy();
				                                        }
				                                    }
				                                    return HELPERS.renderWidgetIntoDomId("view-content-container", view.widget).then(function (widgets) {
				                                        widgets.reverse();
				                                        latestWidgets = latestWidgets.concat(widgets);
				                                    });
				                                });
				                            });
				                            return callback(null);
				                        }).fail(callback);
				                    });
				                })().then(function() {
				                    return sammy;
				                });
				            }).fail(function(err) {
				                console.error(err);                
				            });

				            return views.then(function(sammy) {
				            	sammy.run("#/");
				            });
						});
					}
				}
			]
		);
	};
});
