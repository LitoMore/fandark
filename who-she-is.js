const Fanfou = require('fanfou-sdk');
const async = require('async');

const {
	CONSUMER_KEY: consumerKey,
	CONSUMER_SECRET: consumerSecret,
	FANFOU_USERNAME: username,
	FANFOU_PASSWORD: password
} = require('./config');

const ff = new Fanfou({
	consumerKey,
	consumerSecret,
	username,
	password
});

(async () => {
	await ff.xauth();

	const user = await ff.get('/users/show');

	const {
		followers_count: followersCount,
		friends_count: friendsCount
	} = user;

	const foPages = Math.ceil(followersCount / 60);
	const frPages = Math.ceil(friendsCount / 60);

	const foP = Array.from({length: foPages}, (v, i) => i + 1);
	const frP = Array.from({length: frPages}, (v, i) => i + 1);

	let fullUsers = [];

	async.eachLimit(foP, 20, (page, cb) => {
		ff.get('/users/followers', {page, count: 60})
			.then(list => {
				const users = list.filter(u => {
					return u.followers_count > 2000 && u.followers_count < 3000 && u.friends_count > 0 && u.friends_count < 100;
				}).map(u => {
					return {id: u.id, name: u.name, uid: u.unique_id};
				});
				fullUsers = fullUsers.concat(users);
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
			console.log(fullUsers.map(u => `${u.name} ${u.id}`));
		}
	});

	let fullFriends = [];

	async.eachLimit(frP, 20, (page, cb) => {
		ff.get('/users/friends', {page, count: 60})
			.then(list => {
				const users = list.filter(u => {
					return u.followers_count > 2000 && u.followers_count < 3000 && u.friends_count > 0 && u.friends_count < 100;
				}).map(u => {
					return {id: u.id, name: u.name, uid: u.unique_id};
				});
				fullFriends = fullFriends.concat(users);
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
			console.log(fullFriends.map(u => `${u.name} ${u.id}`));
		}
	});
})();

