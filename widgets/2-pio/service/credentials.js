
define(function() {

	return function() {
		var self = this;

		return self.hook(
			{},
			{
				"credentials": JSON.parse(self.tagContent).uri
			},
			[
				{
					streams: [ "credentials" ],
					handler: function(_credentials) {

						_credentials.on("data", function(data) {

							if (data.$status === 200) {
								return self.setHTM('<div class="alert alert-success" role="alert">' + "Active!" + '</div>');
							} else
							if (
								data.$status === 403 &&
								data.requestScope
							) {
								return self.setHTM('<div class="alert alert-danger" role="alert">' + "Missing Credentials" + ' <a href="/?.requestScope=' + _credentials.data.requestScope + '&.returnTo=' + encodeURIComponent(window.location.href) + '" role="button" class="btn btn-primary">Use my credentials</a>' + '</div>');
							}

							return self.setHTM('<div class="alert alert-danger" role="alert">' + data.$statusReason + '</div>');
						});

						return self.API.Q.resolve();
					}
				}
			]
		);
	};
});
