
const PATH = require("path");

require("io.pinf.server.www").for(module, __dirname, function(app, config, HELPERS) {

	app.get(/\/lib\/(pinf\.jquery\.js)$/, function(req, res, next) {

		return HELPERS.API.SEND(req, "/node_modules/pinf-for-jquery/pinf.jquery.js")
			.root(__dirname)
			.on('error', next)
			.pipe(res);
	});

});
