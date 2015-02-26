define([
	"q",
	"firewidgets",
	"underscore",
	"backbone",
	"jquery.pinf"
], function(Q, FIREWIDGETS, UNDERSCORE, BACKBONE, PINF) {

	function getViews() {
		return Q.resolve(window.API.config.views);
	}

	function renderWidgetIntoDomId(domId, widgetId) {
		var domNode = $("#" + domId);
		domNode.attr("x-widget", widgetId);
		return FIREWIDGETS.scan(domNode, null, {
			scanSelf: true
		});
	}

	var lastWidgets = [];
	function showLogDialog(logPath, options) {
		options = options || {};
		var widget = $("#show-log-dialog-widget");
		if (widget.length === 1) {
			widget.remove();
		}
		$("body").append('<div id="show-log-dialog-widget">' + JSON.stringify({
			logPath: logPath,
			type: options.type || "arbitrary",
			updateUrlHash: options.updateUrlHash || false
		}) + '</div>');
		return renderWidgetIntoDomId("show-log-dialog-widget", "io.pinf.server.log/log-dialog").then(function (widgets) {
			if (lastWidgets) {
			    while (lastWidgets.length > 0) {
			        lastWidgets.shift().destroy();
			    }
			}
		    widgets.reverse();
		    lastWidgets = widgets;
		});
	}

	function ensureFireConsole (instanceId) {
		if (!ensureFireConsole._instance) {
			ensureFireConsole._instance = {};
		}
		if (ensureFireConsole._instance[instanceId]) {
			return ensureFireConsole._instance[instanceId];
		}
		var uri = "http://fireconsole-widget-console." + window.API.config.hostname + ":8013/demo.js";
		var deferred = Q.defer();
		$.pinf.sandbox(uri, function (sandbox) {
	        return sandbox.main(null).then(deferred.resolve, deferred.reject);
	    }, function (err) {
	        console.error("Error while loading bundle '" + uri + "':", err.stack);
	        return deferred.reject(err);
	    });
		return Q.when(deferred.promise).then(function (instance) {
			ensureFireConsole._instance[instanceId] = instance;
			return instance;
		});
	}

	return {
		API: {
			Q: Q,
			BACKBONE: BACKBONE,
			PINF: PINF
		},
		getViews: getViews,
		renderWidgetIntoDomId: renderWidgetIntoDomId,
		showLogDialog: showLogDialog,
		ensureFireConsole: ensureFireConsole
	};

});