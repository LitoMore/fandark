# fandark

Dark side of Fanfou

<div align="center"><img width="75%" height="75%" src="https://raw.githubusercontent.com/LitoMore/fandark/master/screenshot.png" /></div>

## Usage

Download & Install dependencies

```bash
$ git clone git@github.com:LitoMore/fandark.git
$ cd fandark
$ npm install
```

Prepare config file

```bash
$ cp config.json.example config.json
```

Configuration

```json
{
  "CONSUMER_KEY": "key",
  "CONSUMER_SECRET": "secret",
  "FANFOU_USERNAME": "username",
  "FANFOU_PASSWORD": "password",
  "HTTPS": true,
  "REQUEST_LIMIT": 10
}

```

Run

```bash
# Export all statuses
$ node export.js > backup/file1.json

# Check your relationships
$ node fo.js

# Delete all statuses
$ node del.js

# Delete all statuses on schedule
$ node del-schedule.js

# Delete all favorites
$ node unfav.js

# Delete all favorites on schedule
$ node unfav-schedule.js
```

## Related

- [fanfou-sdk](https://github.com/LitoMore/fanfou-sdk-node) - Fanfou SDK for Node.js

## License

MIT © [LitoMore](https://github.com/LitoMore)
