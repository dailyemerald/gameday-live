(function() {

	var chat_socket = io.connect("http://cht.herokuapp.com", {'force new connection': true});
	console.log(chat_socket, "cht.herokuapp")
	var textTemplate = "" +
	"<li class='message'>" +
	"<%= text %><br>" +
	"<small><%= human_time.toLowerCase() %> by <%= name %></small>" + 
	"</li>";

	var tpl = _.template(textTemplate);

	var strip = function (html) {
	   var tmp = document.createElement("DIV");
	   tmp.innerHTML = html;
	   return tmp.textContent || tmp.innerText;
	}

	var prepare = function(message) {
		message.human_time = moment(message.created_at.iso).calendar();
		message.text = message.text.autoLink({ target: "_blank", rel: "nofollow" });
		return message;
	}

	chat_socket.on('status', function (data) {
		console.log('chat status:', data);
		$('#chat-status').html(data);
	});

	chat_socket.on('backlog', function(data) {
		console.log('parse (chat) backlog', data);
		_.each(data, function(data) {
			$('#chat-messages').append( tpl(prepare(data)) );
		});
	});

	chat_socket.on('broadcast_message', function(data) {
		console.log('broadcast_message', data);
		$("#chat-messages").prepend( tpl(prepare(data)) );
	});

	var send_message = function() {
		var text = $('#message-text').val()
		  , name = $('#message-name').val();

		text = strip(text);

		if (text.length > 0 && name.length > 0) {
			chat_socket.emit('send_message', {'name': name, 'text': text});
			$('#message-text').val('');
			$('#chat-status').html('');
		} else {
			$('#chat-status').html('Name and message, please!');
		}
	}

	$(document).ready(function() {
		/*
		$('textarea').keypress(function(e) {
	        if(e.which == 13) {
	            send_message();
	        }
	    });
		*/
		$('#message-send').click(function() {	
			console.log("#message-send click");
			send_message();
		});
	});

})();