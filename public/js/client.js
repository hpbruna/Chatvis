	// on load of page
	$(function () {
	    var socket = io.connect('http://localhost:8080');

var sendUpdatedMessage;
var sendUpdatedLikes;
	    var controls = $('#controls');
	    var deletebutton = $('#deletebutton');
	    var likebutton = $('#likebutton');
	    
	    likebutton.on('click', function () {
	    	var id = likebutton.parents(".message").attr("id");
	    	sendUpdatedLikes(id);
	    })

	    deletebutton.on('click', function () {
	    	var message = likebutton.parents(".message");
	    	var id = message.attr("id");
	    	message.detach(); //data still exists in object, else controlsobject would be deleted
	    	senddeletemessage(id);
	    })

	    var senddeletemessage = function(messageID) {
	    	 // tell server to delete message from object
	            socket.emit('sendDeleteMessage', messageID);
		}

		

	    //var socket = io.connect('http://brainy.jit.su:80');

	    // on connection to server, ask for user's name with an anonymous callback
	    socket.on('connect', function () {
	        // call the server-side function 'adduser' and send one parameter (value of prompt)
	        $('#pagecover').fadeOut(1000);
	        $('#content').fadeIn(10000);
	        socket.emit('adduser', prompt("Met wie hebben we het genoegen?"));

	       // new chat comes from server
	        socket.on('sendnewchat', function (message) {
	        	console.log(message);
	        	var fontsize = 100 + (message.likes * 10) + '%';
	            $('body').append('<div class="message" ID="' + message.id + '" style="left:' + message.xPos + 'px; top: ' + message.yPos + 'px; font-size: ' + fontsize +'">' + message.content + '</div>');
	            
	            $(".message").on({
click: function(){
//
},
mouseenter: function(){
$(this).append(controls);
},
mouseleave: function(){
//$(controls).remove();
}
});

	            $(".message").draggable({
	                start: function () {
	                    // bij de start nog een mooi kleurtje?
	                },
	                drag: function () {
	                    //tijdens ook nog een symbooltje?
	                },
	                stop: function () {
	                    var finalposition = $(this).position();
	                    var messageID = $(this).attr('id');
	                    var xPos = finalposition.left;
	                    var yPos = finalposition.top;
	                    sendUpdatedMessage(messageID, xPos, yPos);
	                }
	            });
	        });

	        sendUpdatedMessage = function (messageID, xPos, yPos) {
	            // tell server to execute 'sendchat' and send along one parameter
	            socket.emit('sendUpdatedMessage', messageID, MouseXposition, MouseYposition);
	        }

	        sendUpdatedLikes = function (messageID) {
	            // tell server to execute 'sendchat' and send along one parameter
	            socket.emit('sendUpdatedLikes', messageID);
	        }

	        socket.on('updateMessage', function (messageID, xPos, yPos) {
	        	$('#' + messageID).offset({
	                top: yPos,
	                left: xPos
	            });
	            });

	             socket.on('updateLikes', function (messageID, likes) {
	        	var fontsize = 100 + (likes * 10) + '%';
	            $('#' + messageID).css('font-size', fontsize);
	        	});


socket.on('deleteMessage', function(messageID) {
	    	 // detach message from DOM
	          $('#' + messageID+ '.message').detach();
		 });



	         socket.on('deletemessage', function(messageID) {
	    	 // detach message from DOM
	           $('.message #' + messageID).detach();
		 });


	        // listener, whenever the server emits 'updateusers', this updates the username list
	        socket.on('updateusers', function (data) {
	            $('#users').empty();
	            $.each(data, function (key, value) {
	                $('#users').append(key + ' ');
	            });
	        });
	        var MouseXposition = 1;
	        var MouseYposition = 1;
	        $(document.body).on('keydown', function (e) {
	            $('#datafield').focus();
	        });
	        $(document).mousemove(function (e) {
	            MouseXposition = e.pageX;
	            MouseYposition = e.pageY;
	        });
	        // when the client hits ENTER on their keyboard
	        $('#datafield').keypress(function (e) {
	            if (e.which == 13) {
	                var message = $('#datafield').val();
	                $('#datafield').val('');
	                // tell server to execute 'sendchat' and send along one parameter
	                socket.emit('newchat', message, MouseXposition, MouseYposition);
	            }
	        });
	    }); // end socket.on
	}); // end document.ready
	