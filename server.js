
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const EXPRESS = require("express");
const SEND = require("send");
const REQUEST = require("request");
const HTTP_PROXY = require("http-proxy");
const DOT = require("dot");
const PIO = require("pio");


var PORT = process.env.PORT || 8080;

exports.main = function(callback) {

	return PIO.forPackage(__dirname).then(function(pio) {

		try {

		    var app = EXPRESS();
		    var proxy = HTTP_PROXY.createProxyServer({});

		    app.configure(function() {
		        app.use(EXPRESS.logger());
		        app.use(EXPRESS.cookieParser());
		        app.use(EXPRESS.bodyParser());
		        app.use(EXPRESS.methodOverride());
		        app.use(app.router);
		    });


		    app.get("/favicon.ico", function (req, res, next) {
		    	return res.end();
		    });

		    app.get(/^\//, function(req, res, next) {


	    		var pathname = req._parsedUrl.pathname;
	    		if (pathname === "/") pathname = "/index.html";
	    		var path = PATH.join(__dirname, "www", pathname);
	    		return FS.exists(path, function(exists) {
	    			if (exists) {
	    				// Serve local file.
						return SEND(req, PATH.basename(path))
							.root(PATH.dirname(path))
							.on('error', next)
							.pipe(res);
	    			}
	    			var overlayPath = PATH.join(__dirname, "www", pathname.replace(/(\.[^\/]+)$/, ".overlay$1"));
		    		return FS.exists(overlayPath, function(exists) {
		    			if (exists) {
		    				function processOverlay() {
				    			var urls = [].concat(pio._config.config["pio.service"].config.www.extends);
				    			function proxyUpstream(host) {
					    			var url = "http://" + host + pathname;
					    			return REQUEST(url, function(err, response, body) {
					    				if (err) return next(err);
					    				if (response.statusCode === 404) {
					    					if (urls.length === 0) return next(new Error("No upstream file found at url '" + url + "' even though we have an overlay at '" + overlayPath + "'! Remove the overlay or make sure the file is served by upstream server."));
					    					return proxyUpstream(urls.pop());
					    				}
					    				if (response.statusCode !== 200) return next(new Error("Did not get status 200 when fetching from: " + url));

					    				return FS.readFile(overlayPath, "utf8", function(err, templateSource) {
					    					if (err) return next(err);

				                            // TODO: Get own instance: https://github.com/olado/doT/issues/112
				                            DOT.templateSettings.strip = false;
				                            DOT.templateSettings.varname = "at";
					                        var compiled = null;
					                        try {
					                            compiled = DOT.template(templateSource);
					                        } catch(err) {
												console.error("templateSource", templateSource);
					                        	console.error("Error compiling template: " + overlayPath);
					                            return next(err);
					                        }


					                        var anchors = {};
											var re = /\{\{=view\.anchor\.([^\}]+)\}\}/g;
											var m;
											while (m = re.exec(body)) {
												var at = {};
												at[m[1]] = true;
					                            try {
													anchors[m[1]] = compiled(at) || "";
					                            } catch(err) {
						                        	console.error("Error running compiled template: " + overlayPath);
						                            return next(err);
					                            }
											}


				                            DOT.templateSettings.varname = "view";
					                        try {
					                            compiled = DOT.template(body);
					                        } catch(err) {
												console.error("body", body);
					                        	console.error("Error compiling template: " + url);
					                            return next(err);
					                        }


				                            var result = null;
				                            try {
				                                result = compiled({
				                                	title: "Our Title",
				                                	anchor: anchors
				                                });
				                            } catch(err) {
					                        	console.error("Error running compiled template: " + url);
					                            return next(err);
				                            }

				                            // TODO: Send proper headers.
				                            res.writeHead(200, {
				                            	"Content-Type": response.headers["content-type"],
				                            	"Content-Length": result.length
				                            });
				                            return res.end(result);
					    				});
					    			});
				    			}
				    			return proxyUpstream(urls.pop());
		    				}
		    				return processOverlay();
		    			}
		    			var urls = [].concat(pio._config.config["pio.service"].config.www.extends);
		    			function forwardUpstream(host) {
							var url = "http://" + host + pathname;
		    				return REQUEST({
		    					url: url,
		    					method: "HEAD"
		    				}, function(err, response, body) {
		    					if (err) return next(err);
		    					if (response.statusCode === 404) {
			    					if (urls.length === 0) return next();
			    					return forwardUpstream(urls.pop());
		    					}
					            return proxy.web(req, res, {
					                target: "http://" + host
					            }, function(err) {
					                if (err.code === "ECONNREFUSED") {
					                    res.writeHead(502);
					                    return res.end("Bad Gateway");
					                }
				                    res.writeHead(500);
				                    console.error(err.stack);
				                    return res.end("Internal Server Error");
					            });
		    				});
		    			}
		    			return forwardUpstream(urls.pop());
		    		});
	    		});
		    });

			var server = app.listen(PORT);

			console.log("Listening at: http://localhost:" + PORT);

		    return callback(null, {
		        server: server
		    });
		} catch(err) {
			return callback(err);
		}
	}).fail(callback);
}

if (require.main === module) {
	return exports.main(function(err) {
		if (err) {
			console.error(err.stack);
			process.exit(1);
		}
		// Keep server running.
	});
}
