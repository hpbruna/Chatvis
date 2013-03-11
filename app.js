var express = require('express');
var app = require('express').createServer();
var io = require('socket.io').listen(app);
var messageID = 0;
var messages = [];

var colorclasses = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];

//app.listen(80);
app.listen(8080);

// routing

 app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
var usernames = {};

io.sockets.on('connection', function (socket) {
	console.log(messages);

	// give a new connection the existing messages
	var value;
	for (value in messages) {
    if (messages.hasOwnProperty(value)) {
        io.sockets.emit('sendnewchat', messages[value])}; 
    }

	

	// new chat message comes from client
	socket.on('newchat', function (data, MouseXposition, MouseYposition) {
		
		messageID++

		messages[messageID] = {id: messageID, content: data, user: socket.username, xPos: MouseXposition, yPos: MouseYposition};
		
		io.sockets.emit('sendnewchat', messages[messageID]);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		socket.username = username;
		usernames[username] = username;
		io.sockets.emit('updateusers', usernames);
	});


	
	socket.on('sendUpdatedMessage', function(messageID, xPos, yPos){
		messages[messageID].xPos = xPos; //update message object
		messages[messageID].yPos = yPos; //update message object

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