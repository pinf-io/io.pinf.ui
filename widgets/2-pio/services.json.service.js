
const PATH = require("path");
const PIO = require("pio");


exports.app = function(req, res, next) {
	return PIO.forPackage(PATH.join(__dirname, "../..")).then(function(pio) {
		return pio.locate().then(function(packages) {
        	var services = {};
			for (var id in packages) {
				services[PATH.basename(packages[id].basePath)] = {};
			}
	        return res.end(JSON.stringify(services, null, 4));
		});
	}).fail(next);
}
