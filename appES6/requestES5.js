define(() => {
	return {
		fromURL: (url, parserType) => {
			let parser
			if(parserType == "DOM") {
				parser = (responseText) => {
					const domParser = new DOMParser()
					const data = domParser.parseFromString(responseText, "text/xml")
					return data
				}
			}

			if(parserType == "JSON") {
				parser = (responseText) => {
					const data = JSON.parse(responseText)
					return data
				}
			}


			return new Promise((resolve, reject) => {
				const xml = new XMLHttpRequest()
				xml.open("GET", url)
				xml.send(null)
				xml.onerror = () => {
					reject(xml.status)
				}
				xml.onreadystatechange = () => {
					if(xml.readyState === XMLHttpRequest.DONE && xml.status >= 200 && xml.status < 300) {
						const data = parser(xml.responseText)
						console.log(data +" from requestES5" )
						resolve(data)
					}
				}
			})

		} 
	}
})