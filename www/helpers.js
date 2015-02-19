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

	return {
		API: {
			Q: Q,
			BACKBONE: BACKBONE,
			PINF: PINF
		},
		getViews: getViews,
		renderWidgetIntoDomId: renderWidgetIntoDomId,
		showLogDialog: showLogDialog
	};

});