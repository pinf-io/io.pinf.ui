
define(function() {

	return function() {
		var self = this;

		return self.server.getResource("./" + self.widget.id + ".htm").then(function(html) {

			self.tag.html(html);

			return;
		});
	};
});
