'use strict';

const schedule = require('node-schedule');
const Fanfou = require('fanfou-sdk');
const async = require('async');

const {
	CONSUMER_KEY: consumerKey,
	CONSUMER_SECRET: consumerSecret,
	FANFOU_USERNAME: username,
	FANFOU_PASSWORD: password,
	REQUEST_LIMIT: requestLimit
} = require('./config');

const ff = new Fanfou({
	consumerKey,
	consumerSecret,
	username,
	password
});

const unfav = ids => {
	async.eachLimit(ids, requestLimit, (id, cb) => {
		ff.post('/favorites/destroy/' + id)
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

(async () => {
})();

const run = async () => {
	await ff.xauth();

	const user = await ff.get('/account/verify_credentials');
	const {favourites_count: favCount} = user;
	const pageCount = Math.ceil(favCount / 60);
	const pages = Array.from({length: pageCount}, (v, i) => i + 1);

	let fullIds = [];

	async.eachLimit(pages, requestLimit, (page, cb) => {
		ff.get('/favorites', {page, count: 60})
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
			unfav(fullIds);
		}
	});
};

schedule.scheduleJob('0 0 * * *', () => {
	run();
});
