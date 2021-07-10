const fetch = require('node-fetch');
const axios = require('axios')

exports.fetcher = fetcher = (url,option) => new Promise(async (resolve,reject) => {
    fetch(url,option)
        .then(res => res.json())
        .then(json => resolve(json))
        .catch( err => reject(err));
})

exports.getBuffer = getBuffer = async (url, options) => {
	try {
		options ? options : {}
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (e) {
		console.log(`Error : ${e}`)
	}
}