
define(function() {

	return function() {
		var self = this;

		var STREAMS = {
			"services": self.config.serviceBaseUri + "/io.pinf.ui/2-pio/services.json"
//			"services/test": "/services/pio-services/services/test.json",
		}

		var streams = {};
		for (var id in STREAMS) {
			streams[id] = self.API.Q.defer();
		}
		function attachToStreams() {
			return self.API.Q.all(Object.keys(streams).map(function(id) {
				return self.server.attachToStream(STREAMS[id]).then(function(stream) {
					streams[id].resolve(stream);
					return;
				});
			}));
		}


		var RESOURCES = {
			"htm": "./" + self.widget.id + ".htm"
		};
		var resources = {};
		for (var id in RESOURCES) {
			resources[id] = self.API.Q.defer();			
		}
		function loadResources() {
			return self.API.Q.all(Object.keys(resources).map(function(id) {
				return self.server.getResource(RESOURCES[id]).then(function(html) {
					resources[id].resolve(html);
					return;
				});
			}));
		}

		function setupUI() {
			return self.API.Q.all([
				streams["services"].promise,
				resources["htm"].promise
			]).spread(function(stream, html) {

				var compiled = self.API.DOT.template(html);

				var services = {};
				for (var serviceId in stream.data) {
					services[serviceId.replace(/\./g, "-")] = stream.data;
				}

				self.tag.html(compiled({
					services: services
				}));

//				updateStatus();
			});
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
		}

		return self.API.Q.all([
			setupUI(),
			attachToStreams(),
			loadResources()
		]);

	};
});
