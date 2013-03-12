var express = require('express');
var app = require('express').createServer();
var io = require('socket.io').listen(app);
var usernames = {};
var messageID = 0;
var messages = [];

//app.listen(80);
app.listen(8080);

// routing

 app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});


io.sockets.on('connection', function (socket) {
	console.log(messages);
	
	// give a new connection the existing messages
	var value;
	for (value in messages) {
    if (messages.hasOwnProperty(value)) {
        socket.emit('sendnewchat', messages[value])}; 
    }

	// new chat message comes from client
	socket.on('newchat', function (data, MouseXposition, MouseYposition) {
		messageID++
		messages[messageID] = {id: messageID, content: data, user: socket.username, xPos: MouseXposition, yPos: MouseYposition, likes: 0};
		io.sockets.emit('sendnewchat', messages[messageID]);
	});

	
	socket.on('sendUpdatedMessage', function(messageID, xPos, yPos){
		messages[messageID].xPos = xPos; //update message object
		messages[messageID].yPos = yPos; //update message object
		io.sockets.emit('updateMessage', messageID, xPos, yPos);
	});

	socket.on('sendUpdatedLikes', function(messageID){
		messages[messageID].likes = messages[messageID].likes + 1; //update message object
		var likes = messages[messageID].likes;
		io.sockets.emit('updateLikes', messageID, likes);
	});

	socket.on('sendDeleteMessage', function(messageID){
		delete messages[messageID]; //delete message object
		io.sockets.emit('deleteMessage', messageID);
	});


	// client adds user, user is send to all clients
	socket.on('adduser', function(username){
		socket.username = username;
		usernames[username] = username;
		io.sockets.emit('updateusers', usernames);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username en update the client userlists
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		
	});
});