"use strict";

define(function () {
	return {
		fromURL: function fromURL(url, parserType) {
			console.log(url);
			var parser = void 0;
			if (parserType == "DOM") {
				parser = function parser(responseText) {
					var domParser = new DOMParser();
					var data = domParser.parseFromString(responseText, "text/xml");
					return data;
				};
			}

			if (parserType == "JSON") {
				parser = function parser(responseText) {
					var data = JSON.parse(responseText);
					return data;
				};
			}

			return new Promise(function (resolve, reject) {
				var xml = new XMLHttpRequest();
				xml.open("GET", url);
				xml.send(null);
				xml.onerror = function () {
					reject(xml.status);
				};
				xml.onreadystatechange = function () {
					if (xml.readyState === XMLHttpRequest.DONE && xml.status >= 200 && xml.status < 300) {
						var data = parser(xml.responseText);
						console.log(data);
						resolve(data);
					}
				};
			});
		}
	};
});

//# sourceMappingURL=request.js.map