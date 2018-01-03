requirejs.config({
	baseUrl: 'app',
	paths: {
		test: 'test',
		dateHelper: 'dateHelper',
		xmlHelper: 'xmlHelper',
		algorithm: 'algorithm'
	}
})

requirejs(['main'])