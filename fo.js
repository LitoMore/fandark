'use strict';

const Fanfou = require('fanfou-sdk');
const Table = require('cli-table2');
const async = require('async');
const chalk = require('chalk');
const pangu = require('pangu');
const ora = require('ora');

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

const xauth = () => {
	return ff.xauth();
};

const getFriends = () => {
	return ff.get('/friends/ids', {});
};

const getFollowers = () => {
	return ff.get('/followers/ids', {});
};

const find1 = async spinner => {
	const friends = await getFriends();
	const list = [];
	return new Promise((resolve, reject) => {
		async.eachLimit(friends, requestLimit, (id, callback) => {
			ff.get('/friendships/show', {
				source_login_name: username,
				target_login_name: id
			}).then(res => {
				if (res.relationship.source.followed_by === 'false') {
					const name = res.relationship.target.screen_name;
					list.push({
						type: 'user',
						name,
						id
					});
					spinner.text = `谁没关注你 - ${chalk.green(name)} ${chalk.blue(id)}`;
				}

				callback();
			}).catch(error => {
				const name = pangu.spacing(error.message);
				list.push({
					type: 'error',
					name,
					id
				});
				spinner.text = `谁没关注你 - ${chalk.red(name)} ${chalk.blue(id)}`;
				callback();
			});
		}, err => {
			if (err) {
				reject(err);
			} else {
				resolve(list);
			}
		});
	});
};

const find2 = async spinner => {
	const followers = await getFollowers();
	const list = [];
	return new Promise((resolve, reject) => {
		async.eachLimit(followers, requestLimit, (id, callback) => {
			ff.get('/friendships/show', {
				source_login_name: username,
				target_login_name: id
			}).then(res => {
				if (res.relationship.source.following === 'false') {
					const name = res.relationship.target.screen_name;
					list.push({
						type: 'user',
						name,
						id
					});
					spinner.text = `你没关注谁 - ${chalk.green(name)} ${chalk.blue(id)}`;
				}

				callback();
			}).catch(error => {
				const name = pangu.spacing(error.message);
				list.push({
					type: 'error',
					name,
					id
				});
				spinner.text = `谁没关注你 - ${chalk.red(name)} ${chalk.blue(id)}`;
				callback();
			});
		}, err => {
			if (err) {
				reject(err);
			} else {
				resolve(list);
			}
		});
	});
};

const run = async () => {
	await xauth();

	const spinner1 = ora('谁没关注你').start();
	const result1 = await find1(spinner1);
	spinner1.succeed('谁没关注你 ' + chalk.green(`(${result1.length})`));

	const spinner2 = ora('你没关注谁').start();
	const result2 = await find2(spinner2);
	spinner2.succeed('你没关注谁 ' + chalk.green(`(${result2.length})`));

	// Draw Table
	const table = new Table({
		head: [chalk.white('谁没关注你'), chalk.white('你没关注谁')],
		chars: {
			mid: '',
			'left-mid': '',
			'mid-mid': '',
			'right-mid': ''
		}
	});
	const lineCount = result1.length > result2.length ? result1.length : result2.length;
	for (let i = 0; i < lineCount; i++) {
		const line = [
			i < result1.length ?
				`${result1[i].type === 'error' ?
					chalk.bgRed(result1[i].name) :
					chalk.green(result1[i].name)} ${chalk.blue(result1[i].id)}` :
				'',
			i < result2.length ?
				`${result2[i].type === 'error' ?
					chalk.bgRed(result2[i].name) :
					chalk.green(result2[i].name)} ${chalk.blue(result2[i].id)}` :
				''
		];
		table.push(line);
	}

	console.log(table.toString());
};

run();
