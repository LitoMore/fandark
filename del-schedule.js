'use strict';

const schedule = require('node-schedule');
const Fanfou = require('fanfou-sdk');
const async = require('async');

const {
	CONSUMER_KEY: consumerKey,
	CONSUMER_SECRET: consumerSecret,
	FANFOU_USERNAME: username,
	FANFOU_PASSWORD: password,
	HTTPS: https,
	REQUEST_LIMIT: requestLimit
} = require('./config');

const ff = new Fanfou({
	consumerKey,
	consumerSecret,
	username,
	password,
	protocol: https ? 'https:' : 'http:',
	fakeHttps: Boolean(https)
});

const del = ids => {
	async.eachLimit(ids, requestLimit, (id, cb) => {
		ff.post('/statuses/destroy', {id})
			.then(() => {
				cb();
			})
			.catch(error => {
				console.log(error.message);
				cb();
			});
	}, error => {
		if (error) {
			console.log(error);
		} else {
			console.log('Done');
		}
	});
};

const run = async () => {
	await ff.xauth();

	const user = await ff.get('/account/verify_credentials');
	const {statuses_count: statusesCount} = user;
	const pageCount = Math.ceil(statusesCount / 60);
	const pages = Array.from({length: pageCount}, (v, i) => i + 1);

	let fullIds = [];

	async.eachLimit(pages, requestLimit, (page, cb) => {
		ff.get('/statuses/user_timeline', {page, count: 60})
			.then(list => {
				const ids = list.map(status => status.id);
				fullIds = fullIds.concat(ids);
				cb();
			})
			.catch(error => {
				console.log(error.message);
				cb();
			});
	}, error => {
		if (error) {
			console.log(error);
		} else {
			del(fullIds);
		}
	});
};

schedule.scheduleJob('0 0 * * *', () => {
	run();
});
