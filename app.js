var express = require('express');
var app = require('express').createServer();
var io = require('socket.io').listen(app);
var messageID = 0;

var colorclasses = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];

app.listen(8080);

// routing

 app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
var usernames = {};

io.sockets.on('connection', function (socket) {

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data, MouseXposition, MouseYposition) {
		// we tell the client to execute 'updatechat' with 2 parameters
		//console.log(socket);
		messageID++
		io.sockets.emit('updatechat', socket.username, socket.usercolor, messageID, data, MouseXposition, MouseYposition);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// we store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		socket.usercolor =  colorclasses.shift();

		usernames[username] = username;
		// echo to client they've connected
		//socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo globally (all clients) that a person has connected
		//socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		// update the list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
	});


	
	socket.on('sendUpdatedMessage', function(messageID, xPos, yPos){
		io.sockets.emit('updateMessage', messageID, xPos, yPos);
	});



	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		//socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});