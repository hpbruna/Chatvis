 "use strict";

var express = require('express');
var app = require('express').createServer();
var io = require('socket.io').listen(app);
var usernames = {};
var ideaID = 0;
var ideas = [];

//app.listen(80);
app.listen(8080);

//io.set('log level', 2);

// routing
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});


io.sockets.on('connection', function (socket) {
	// give a new connection all the existing ideas
	var value;
	for (value in ideas) {
    if (ideas.hasOwnProperty(value)) {
        socket.emit('sendNewIdea', ideas[value]);}
    }

	// new idea comes from client
	socket.on('newIdea', function (data, mouseXposition, mouseYposition) {
		ideaID++;
		ideas[ideaID] = {id: ideaID, content: data, user: socket.username, xPos: mouseXposition, yPos: mouseYposition, likes: 0};
		io.sockets.emit('sendNewIdea', ideas[ideaID]);
	});

	// idea is updated
	socket.on('sendUpdatedIdea', function(ideaID, xPos, yPos){
		ideas[ideaID].xPos = xPos; //update Idea object
		ideas[ideaID].yPos = yPos; //update Idea object
		io.sockets.emit('updateIdea', ideaID, xPos, yPos);
	});

	// idea is liked
	socket.on('sendUpdatedLikes', function(ideaID, increase){
		ideas[ideaID].likes = ideas[ideaID].likes + increase; //update Idea object
		var likes = ideas[ideaID].likes;
		io.sockets.emit('updateLikes', ideaID, likes);
	});

	// idea is deleted
	socket.on('sendDeleteIdea', function(ideaID){
		delete ideas[ideaID]; //delete Idea object
		io.sockets.emit('deleteIdea', ideaID);
	});



	// Users
	socket.on('addUser', function(username){
		socket.username = username;
		usernames[username] = username;
		io.sockets.emit('updateUsers', usernames);
	});

	// when the client disconnects
	socket.on('disconnect', function(){
		// remove the username en update the client userlists
		delete usernames[socket.username];
		io.sockets.emit('updateUsers', usernames);
		
	});
});