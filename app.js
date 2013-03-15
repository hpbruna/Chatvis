 "use strict";
 var express = require('express');
 var app = require('express').createServer();
 var io = require('socket.io').listen(app);
 var usernames = {};
 var ideaID = 0;
 var ideas = {};
 var boards = {};
 var util = require('util'); //debug only


 //app.listen(80);
 app.listen(8080);
 io.set('log level', 2);

 // routing
 app.use(express.static(__dirname + '/public'));
 app.get('/', function(req, res) {
     res.sendfile(__dirname + '/index.html');
 });

 io.sockets.on('connection', function(socket) {


     // new idea comes from client
     socket.on('newIdea', function(data, mouseXposition, mouseYposition) {
         ideaID++;
         boards[socket.room][ideaID] = {
             id: ideaID,
             content: data,
             user: socket.username,
             xPos: mouseXposition,
             yPos: mouseYposition,
             likes: 0
         };

         //send idea to everyone is the same room as the sender.
         io.sockets. in (socket.room).emit('sendNewIdea', boards[socket.room][ideaID]);


         console.log(util.inspect(boards, false, null));


     });

     // idea is updated 
     socket.on('sendUpdatedIdea', function(ideaID, xPos, yPos) {
         boards[socket.room][ideaID].xPos = xPos; //update Idea object
         boards[socket.room][ideaID].yPos = yPos; //update Idea object
         io.sockets. in (socket.room).emit('updateIdea', ideaID, xPos, yPos);
     });

     // idea is liked
     socket.on('sendUpdatedLikes', function(ideaID, increase) {
         boards[socket.room][ideaID].likes = boards[socket.room][ideaID].likes + increase; //update Idea object
         var likes = boards[socket.room][ideaID].likes;
         io.sockets. in (socket.room).emit('updateLikes', ideaID, likes);
     });

     // idea is deleted
     socket.on('sendDeleteIdea', function(ideaID) {
         delete boards[socket.room][ideaID]; //delete Idea object
         io.sockets. in (socket.room).emit('deleteIdea', ideaID);
     });

     // Users
     socket.on('addUser', function(username, boardname, hash) {
         socket.username = username;

         //create a board or connect to existing board
         if (hash !== 0) {
             socket.room = hash.substr(1); //deletes # sign from beginning of string

             if (typeof boards[socket.room] === 'undefined') {
                 boards[socket.room] = {};
                 boards[socket.room].usernames = {};
             } else {
                 // give a new connection all the existing ideas if a board exists
                 var value;
                 for (value in boards[socket.room]) {
                    if (value !== 'usernames') { //these are not messages.
                     console.log('value: ' + value);
                     socket.emit('sendNewIdea', boards[socket.room][value]);
                 } // end check for usernames
                 } // end for loop

             }

         } else {
             var now = new Date().getTime();
             socket.room = boardname + now;
             boards[socket.room] = {};
             boards[socket.room].usernames = {};

         }


         boards[socket.room].usernames[username] = username;

         socket.join(socket.room);
         io.sockets. in (socket.room).emit('updateUsers', boards[socket.room].usernames);


     });

     // when the client disconnects
     socket.on('disconnect', function() {
         // remove the username en update the client userlists
         delete boards[socket.room].usernames[socket.username];
         socket.leave(socket.room);
         io.sockets.emit('updateUsers', boards[socket.room].usernames);
     });
 });