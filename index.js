'use strict'

const Fanfou = require('fanfou-sdk')
const async = require('async')
const chalk = require('chalk')
const pangu = require('pangu')

const {
  CONSUMER_KEY,
  CONSUMER_SECRET,
  FANFOU_USERNAME,
  FANFOU_PASSWORD
} = require('./config')

const ff = new Fanfou({
  auth_type: 'xauth',
  consumer_key: CONSUMER_KEY,
  consumer_secret: CONSUMER_SECRET,
  username: FANFOU_USERNAME,
  password: FANFOU_PASSWORD
})

const xauth = () => {
  return new Promise((resolve, reject) => {
    ff.xauth((err, res) => {
      err ? reject(err) : resolve(res)
    })
  })
}

const getFriends = () => {
  return new Promise((resolve, reject) => {
    ff.get('/friends/ids', {}, (err, res) => {
      err ? reject(err) : resolve(res)
    })
  })
}

const findout = async () => {
  const friends = await getFriends()
  console.log('你关注了却没关注你的人：')
  async.each(friends, (id, callback) => {
    ff.get('/friendships/show', {
      source_login_name: FANFOU_USERNAME,
      target_login_name: id
    }, (err, res) => {
      if (err) {
        console.log(`${chalk.bgRed.white(pangu.spacing(err.message))} ${chalk.blue(id)}`)
        callback()
      } else {
        if (res.relationship.source.followed_by === 'false') {
          console.log(`${chalk.green(res.relationship.target.screen_name)} ${chalk.blue(res.relationship.target.id)}`)
        }
        callback()
      }
    })
  }, err => {
    if (err) console.log('Error!')
  })
}

const run = async () => {
  await xauth()
  findout()
}

run()
