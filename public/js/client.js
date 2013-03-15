	// on load of page
	$(function() {
		//"use strict";

		var socket = io.connect('http://localhost:8080');
		//var socket = io.connect('http://brainy.jit.su:80');


		var controls = $('#controls');
		var board = $('#board');
		var deletebutton = $('#deletebutton');
		var likebutton = $('#likebutton');
		var dislikebutton = $('#dislikebutton');
		var mouseXposition = 100;
		var mouseYposition = 100;


		likebutton.on('click', function() {
			var id = likebutton.parents(".idea").attr("id");
			var increase = 1;
			sendUpdatedLikes(id, increase);
		});

		dislikebutton.on('click', function() {
			var id = likebutton.parents(".idea").attr("id");
			var increase = -1;
			sendUpdatedLikes(id, increase);
		});

		deletebutton.on('click', function() {
			var idea = likebutton.parents(".idea");
			var id = idea.attr("id");
			idea.detach(); //data still exists in object, else controlsobject would be deleted
			sendDeleteIdea(id);
		});

		var sendDeleteIdea = function(ideaID) {
			// tell server to delete idea from object
			socket.emit('sendDeleteIdea', ideaID);
		};

		socket.on('connect', function() {

			//fade out the spinner
			$('#pagecover').fadeOut(1000);
			$('#content').fadeIn(10000);

			socket.emit('addUser', prompt("Met wie hebben we het genoegen?"));

			// listeners voor server events

			socket.on('sendNewIdea', function(idea) {

				var fontsize = 100 + (idea.likes * 30) + '%';
				board.append('<div class="idea" ID="' + idea.id + '" style="left:' + idea.xPos + 'px; top: ' + idea.yPos + 'px; font-size: ' + fontsize + '">' + idea.content + '</div>');
				$(".idea").on({
					click: function() {
						// wat wordt het klikgedrag
					},
					mouseenter: function() {
						$(this).append(controls);
					},
					mouseleave: function() {
						//controls.detach();
				}
				});

			$(".idea").draggable({
				start: function() {
					// bij de start nog een mooi kleurtje?
				},
				drag: function() {
					//tijdens ook nog een symbooltje?
				},
				stop: function() {
					var finalposition = $(this).position();
					var ideaID = $(this).attr('id');
					var xPos = finalposition.left;
					var yPos = finalposition.top;
					sendUpdatedIdea(ideaID, xPos, yPos);
				}
			});
			});

		socket.on('updateIdea', function(ideaID, xPos, yPos) {
			$('#' + ideaID).offset({
				top: yPos,
				left: xPos
			});
		});

		socket.on('deleteIdea', function(ideaID) {
			// detach idea from DOM
			$('#' + ideaID + '.idea').detach();
		});

		socket.on('updateLikes', function(ideaID, likes) {
			var fontsize = 100 + (likes * 30) + '%';
			$('#' + ideaID).css('font-size', fontsize);
		});

		socket.on('updateUsers', function(data) {
			$('#users').empty();
			$.each(data, function(key, value) {
				$('#users').append(key + ' ');
			});
		});


		// triggers to server

		sendUpdatedIdea = function(ideaID, xPos, yPos) {
			// tell server to update idea-object with position and send updated idea to clients.
			socket.emit('sendUpdatedIdea', ideaID, xPos, yPos);
		};
		sendUpdatedLikes = function(ideaID, increase) {
			// tell server to update Likes in idea-object and send updated object to clients.
			socket.emit('sendUpdatedLikes', ideaID, increase);
		};


		// typing and sending the idea
		$(document.body).on('keydown', function() {
			$('#ideafield').focus(); // makes that all typing is set for the idea.
		});

		$(document).mousemove(function(e) {
			mouseXposition = e.pageX;
			mouseYposition = e.pageY;
		});

		// when the client hits ENTER on their keyboard
		$('#ideafield').keypress(function(e) {
			if (e.which === 13) {
				var idea = $('#ideafield').val();
				$('#ideafield').val('');
				socket.emit('newIdea', idea, mouseXposition, mouseYposition);
			}
		});
		}); // end socket.on
	}); // end document.ready
	