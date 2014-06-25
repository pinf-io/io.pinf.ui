define([
	"q",
	"firewidgets",
	"underscore",
	"backbone"
], function(Q, FIREWIDGETS, UNDERSCORE, BACKBONE) {

	function getViews() {
		return Q.resolve(window.API.config.views);
	}

	function renderWidgetIntoDomId(domId, widgetId) {
		var domNode = $("#" + domId);
		domNode.attr("x-widget", widgetId);
		return FIREWIDGETS.scan(domNode.parent());
	}

	return {
		API: {
			Q: Q,
			BACKBONE: BACKBONE
		},
		getViews: getViews,
		renderWidgetIntoDomId: renderWidgetIntoDomId
	};

});