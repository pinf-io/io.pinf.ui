
define(function() {

	return function() {
		var self = this;

		return self.hook(
			{
				"htm": "./" + self.widget.id + ".htm"
			},
			{},
			[
				{
					resources: [ "htm" ],
					handler: function(_htm) {

						self.api.showMetaDialog = function(meta) {
							$('#modal-viewer-log-meta DIV.modal-body', self.tag).html('<pre>' + JSON.stringify(meta, null, 4) + '</pre>');
							$('#modal-viewer-log-meta', self.tag).modal({
								show: true
							});
						}

						self.api.showRawLogDialog = function(type, id) {
							window.API.helpers.showLogDialog(id, {
								type: type,
								updateUrlHash: true
							});
						}

						return self.setHTM(_htm).then(function(tag) {
							$("CODE.setup-info-telnet").html("telnet log." + window.API.config.hostname + " 8115");
							$('#modal-viewer-log-meta', self.tag).modal({
								show: false
							});
							if (window.location.hash) {
								var m = window.location.hash.match(/^\#\/logs\/([^\/]+)\/(.+)$/);
								if (m) {
									self.api.showRawLogDialog(m[1], m[2]);
								}
							}
							return tag;
						});
					}
				}
			]
		);
	};
});

