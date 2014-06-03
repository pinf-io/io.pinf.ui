
define(function() {

	return function() {
		var self = this;

		return self.hook(
			{
				"htm": "./" + self.widget.id + ".htm"
			},
			{
				"services": self.config.serviceBaseUri + "/io.pinf.ui/2-pio/services.json"
//				"services/test": "/services/pio-services/services/test.json",
			},
			[
				{
					resources: [ "htm" ],
					streams: [ "services" ],
					handler: function(_htm, _services) {

						var services = {};
						for (var serviceId in _services.data) {
							services[serviceId.replace(/\./g, "-")] = _services.data[serviceId];
						}

						return self.setHTM(_htm, {
							services: services
						});
					}
				}
			]
		);
/*
			function updateStatus() {
				return self.API.Q.all([
					streams["services/status"].promise
				]).spread(function(status) {
					function sync() {
						for (var serviceId in status.data) {
							var statusNode = $("#" + serviceId.replace(/\./g, "-") + "-status");
							statusNode.html("");
							if (status.data[serviceId].available) {
								statusNode.html("YES!!!");
							}
						}
					}
					status.on("changed", sync);
					sync();
				});
			}
*/
	};
});
