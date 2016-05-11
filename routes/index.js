var express = require('express');
var router = express.Router();
var Client = require('hangupsjs');
var Q = require('q');
var rp = require('request-promise');
require('dotenv').config();

var creds = function() {
  return {
    auth: Client.authStdin
  };
};

var client = new Client();

// set more verbose logging
// client.loglevel('debug');

var reconnect = function() {
    client.connect(creds).then(function() {
        // we are now connected. a `connected`
        // event was emitted.
    });
};

// whenever it fails, we try again
client.on('connect_failed', function() {
    Q.Promise(function(rs) {
        // backoff for 3 seconds
        setTimeout(rs,3000);
    }).then(reconnect);
});

client.on('chat_message', function(ev) {
	var message = ev.chat_message.message_content.segment[0].text;
	var payload = {
	  			channel: '#wfhangouts',
	  			username: 'some_noob',
	  			text: message
	}

	console.log(JSON.stringify(payload));

	params = {
	  	uri: process.env.slackUrl,
	  	method: 'POST',
	  	body: JSON.stringify(payload)
	}

  	rp(params)
  	.then(function(success){
  		console.log(success);
  	},function(err){
  		console.log(err);
  	})
  	
});

// start connection
reconnect();

/* GET home page. */
router.post('/test', function(req, res, next) {
	if(req.body.user_name!='slackbot') {
		console.log(process.env.wfChat);

		bld = new Client.MessageBuilder();
		segments = bld.bold(req.body.user_name+': ').text(req.body.text).toSegments();

		client.sendchatmessage(process.env.wfChat,segments)
		.then(function(success){
			console.log('success!');
		},function(err){
			console.log('fuck');
		});

	}

});

module.exports = router;
