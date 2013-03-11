	// on load of page
	$(function () {
	    var socket = io.connect('http://localhost:8080');
	    

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
	            $('body').append('<div class="message" ID="' + message.id + '" style="left:' + message.xPos + 'px; top: ' + message.yPos + 'px;">' + message.content + '</div>');
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
	        var sendUpdatedMessage = function (messageID, xPos, yPos) {
	            // tell server to execute 'sendchat' and send along one parameter
	            socket.emit('sendUpdatedMessage', messageID, MouseXposition, MouseYposition);
	        }
	        socket.on('updateMessage', function (messageID, xPos, yPos) {
	            $('#' + messageID).offset({
	                top: yPos,
	                left: xPos
	            })
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
	