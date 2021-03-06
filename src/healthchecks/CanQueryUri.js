const Healthcheck = require('../Healthcheck');
const http = require('http');
const https = require('https');
const url = require('url');

module.exports = class CanQueryUri extends Healthcheck {
	constructor (timeout) {
		super();
		this.timeout = timeout || 3000;
	}

	get name () {
		return `Can Query site: ${this.siteName}`;
	}

	resolver () {
		const client = (url.parse(this.uri).protocol === 'https:') ? https : http;

		return new Promise((resolve, reject) => {
			client.get(this.uri, res => {
				// Node http and https require data to be consumed, even though
				// we are not using it here.
				res.on('data', () => {});
				if (res.statusCode === 200) return resolve(`${this.siteName} is available`);

				res.on('end', () => {
					return reject({
						status: `${res.statusCode} ${res.statusMessage}`,
						uri: this.uri,
					});
				});
			}).on('error', (err) => {
				// http and https treat an inability to hit the server or timeouts
				// differently so they throw an error instead of being passed to
				// the callback. This hook handles this.
				return reject({
					error: err,
					uri: this.uri,
				});
			});
		});
	};
};
