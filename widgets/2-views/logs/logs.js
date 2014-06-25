
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

						var baseUrl = "http://io-pinf-server-log." + window.API.config.hostname + ":8013";


						self.api.showMetaDialog = function(meta) {
							$('#modal-viewer-log-meta DIV.modal-body', self.tag).html('<pre>' + JSON.stringify(meta, null, 4) + '</pre>');
							$('#modal-viewer-log-meta', self.tag).modal({
								show: true
							});
						}


						var activeId = null;
						var loadId = null;
					    var buffer = [];
					    var blankPageLoadedListener = function(event) {
					    	if (typeof event.data === "string") {	
						    	if (event.data === "LOG_BLANK_PAGE_LOADED") {
							    	if (buffer === false) return;
							    	var buffered = buffer;
							    	buffer = false;
									if (loadId) {
										loadLog(loadId);
										loadId = null;
									}
							    	buffered.forEach(appendToLog);
						    	} else
						    	if (event.data === "CLEAR_LOG") {
						    		clearLog();
						    	}
						    } else
					    	if (typeof event.data === "object") {	
						    	if (event.data.action === "SYNC_MENU") {
									if (typeof event.data.startOffset !== "undefined") {
										$("#modal-viewer-rawlog TD.menu DIV.start", self.tag).html("Start: " + event.data.startOffset);
									}
									if (typeof event.data.size !== "undefined") {
						            	$("#modal-viewer-rawlog TD.menu DIV.size", self.tag).html("Size: " + event.data.size);
									}
								}
					    	}
					    };
					    window.addEventListener("message", blankPageLoadedListener, false);
					    self.on("destroy", function() {
						    window.removeEventListener("message", blankPageLoadedListener, false);
					    });

					    function clearLog() {
							buffer = [];
							$("#modal-viewer-rawlog DIV.modal-body IFRAME", self.tag).attr("src", baseUrl + "/log-viewer?time=" + Date.now());
					    }
					    function loadLog(id) {
					    	if (buffer === false) {
						    	$("#modal-viewer-rawlog DIV.modal-body IFRAME", self.tag)[0].contentWindow.postMessage({
						    		action: "FETCH_LOG",
						    		id: id
						    	}, "*");
						    } else {
						    	loadId = id;
						    }
					    }
					    function appendToLog(html) {
					    	if (buffer === false) {
						    	$("#modal-viewer-rawlog DIV.modal-body IFRAME", self.tag)[0].contentWindow.postMessage({
						    		action: "APPEND_HTML",
						    		html: html
						    	}, "*");
					    	} else {
					    		buffer.push(html);
					    	}
					    }


						self.api.showRawLogDialog = function(type, id) {
							clearLog();
							appendToLog('<div class="alert alert-info">Loading ...</div>');
							activeId = type + "/" + id;
							$("#modal-viewer-rawlog .modal-title", self.tag).html("Log Stream: " + activeId.split("/").slice(1).join("/"));
			                window.location.hash = "#/logs/" + activeId;
			                loadLog(activeId);
							$('#modal-viewer-rawlog').modal({
								show: true
							});
						}

						return self.setHTM(_htm).then(function(tag) {
							$("CODE.setup-info-telnet").html("telnet " + window.API.config.hostname + " 8115");
							$('#modal-viewer-rawlog', tag).modal({
								show: false
							});
							$('#modal-viewer-log-meta', self.tag).modal({
								show: false
							});
							$("#modal-viewer-rawlog TD.menu BUTTON.button-showall", self.tag).click(function() {
								$("#modal-viewer-rawlog DIV.modal-body IFRAME", self.tag).attr("src", baseUrl + "/" + activeId.split("/").shift() + "/download?id=" + activeId.split("/").slice(1).join("/") + "&format=html&time=" + Date.now());
							});
							$("#modal-viewer-rawlog TD.menu BUTTON.button-download", self.tag).click(function() {
								$("#modal-viewer-rawlog DIV.modal-body IFRAME", self.tag).attr("src", baseUrl + "/" + activeId.split("/").shift() + "/download?id=" + activeId.split("/").slice(1).join("/") + "&format=raw&time=" + Date.now());
							});
							$("#modal-viewer-rawlog TD.menu BUTTON.button-print", self.tag).click(function() {
								$("#modal-viewer-rawlog DIV.modal-body IFRAME", self.tag)[0].contentWindow.postMessage("PRINT", "*");
							});
							$('#modal-viewer-rawlog', tag).on('show.bs.modal', function () {
								$('#modal-viewer-rawlog .modal-body', tag).css('height', $(window).height() - 160);
							});
							$('#modal-viewer-log-meta', tag).on('show.bs.modal', function () {
								$('#modal-viewer-log-meta .modal-body', tag).css('height', $(window).height() - 160);
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

