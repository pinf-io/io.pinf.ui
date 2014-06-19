define([
	"q",
	"firewidgets"
], function(Q, FIREWIDGETS) {

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
			Q: Q
		},
		getViews: getViews,
		renderWidgetIntoDomId: renderWidgetIntoDomId
	};

});