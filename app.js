(function() {
	var strdecode = function(data) {
	  try {
	  	return JSON.parse( decodeURIComponent( escape ( data ) ) );
	  } catch (error) {
		return {}	//TODO: this is bad.
	  }
	}

	//////////////////////////////////////

	var socket = io.connect('http://dev.dailyemerald.com:6767/', {'force new connection': true});

	var tplInstagram = Handlebars.compile($('#tplInstagram').html());
	var tplTwitter   = Handlebars.compile($('#tplTwitter').html());
	 
	socket.on('force_reload', function() {
		window.location.reload();
	});

	socket.on('rebuild', function(items) { 
		console.log('rebuild', items);
		try {
		  console.log('rebuild', items);
		  var itemsLength = items.length;
		  for (var i=0; i<itemsLength; i++) {
			var idx = itemsLength - i - 1;
			//console.log(idx, items[idx]);
			processNewItem( items[idx] );
		  }		
		} catch (error) {
			console.log('error', error)
		    //socket.emit('error', JSON.stringify(error));
		}
	});

	socket.on('incremental_rebuild', function(items) {
		items.forEach(function(item) {
			processNewItem(item);
		});
	});

	//socket.emit('hello', {}); // this tells the server to make a new build set and send it with the 'rebuild' event below:		

	socket.on('newItem', function(item) {		
		processNewItem( strdecode(item) );
	});

	////////////////////////////////////////////////////////////////////////////

	window.newItems = 0;
	window.itemsToShow = [];
	window.itemsAlreadyHere = {};
	window.lifetimeDupes = 0;

	var processNewItem = function(item) {
		//console.log('processNewItem', item)
		if (typeof item.d_id != "undefined") {
			if (window.itemsAlreadyHere[item.d_id] === true) {
				window.lifetimeDupes += 1
				//socket.emit("dupeItem", {d_id: item.d_id, lifetimeDupes: window.lifetimeDupes});		
				console.log("dupe for", item.d_id);
				return false;
			} else {
				window.itemsAlreadyHere[item.d_id] = true;
			}
		} else {
			//console.log("no d_id property on incoming item!", item);
		}
		
		if (item.type === "instagram") {
			//console.log('process new item got item.data for isntagram:',item.data);
			cleanedItem = {
				image: item.data.images.standard_resolution.url,
				thumb: item.data.user['profile_picture'],
				title: item.data.user.full_name,
				comment: "&nbsp;\n",
				time: item.time
			};
			if (item.data && item.data.caption && typeof item.data.caption.text === "string") {
				cleanedItem.comment = item.data.caption.text;
			}
			//console.log(item.data);
		    //$("#loadingzone").append( tplImagePreloader({image: item.data.images.low_resolution.url}) );
			$("#instagram").prepend( tplInstagram(cleanedItem) );
			//itemsToShow.push( tplInstagram(cleanedItem) );
			
			
	    } else if (item.type === "twitter") {
		    //console.log("tweet!", item.data);
		    //$("#loadingzone").append(tplImagePreloader({image:item.data.thumbnail}));
			//console.log('new tweet...', item)
			item.data.content = item.data.content.autoLink({ target: "_blank", rel: "nofollow" });
			$("#twitter").prepend( tplTwitter(item.data) );
			//itemsToShow.push( tplTwitter(item.data) );

		} else {
			console.log("unknown item type");
		}
	}

	console.log(socket.emit('pull'), 'pull');

	$(document).ready(function() {
		console.log("app.js: document ready.");			 
	});

})();


(function() {
	function GUID () {
	    var S4 = function () {
	        return Math.floor(
	                Math.random() * 0x10000 /* 65536 */
	            ).toString(16);
	    };

	    return (
	            S4() + S4() + "-" +
	            S4() + "-" +
	            S4() + "-" +
	            S4() + "-" +
	            S4() + S4() + S4()
	        );
	}
	var guid = GUID();
	var url_base = "http://fathomless-fjord-4295.herokuapp.com/metric";

	var send_metrics = function() {
		var time_on_site = parseInt((new Date() - window.load_start)/1000);
		var counts = {
			'instagram': $(".instagram").length, 
			'twitter':  $(".tweet").length,
			'chats': $("#chat-messages").find("li").length,
			'time_on_site': time_on_site,
			'guid': guid,
			'version': 1,
			'width': window.innerWidth,
		}	
		counts = JSON.stringify(counts);
		$.ajax({
     		url: url_base+"?data="+counts,
     		dataType: 'jsonp', 
     		success:function(json){
     		},
     		error:function(){ 
   			},
		});
	}
	setInterval(function() {
		send_metrics();
	}, 10000);
	send_metrics();

})();


(function() {
  var autoLink,
    __slice = [].slice;

  autoLink = function() {
    var callbackThunk, key, link_attributes, option, options, url_pattern, value;
    options = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    link_attributes = '';
    option = options[0];
    url_pattern = /(^|\s)(\b(https?|ftp):\/\/[\-A-Z0-9+\u0026@#\/%?=~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~_|])/gi;
    if (!(options.length > 0)) {
      return this.replace(url_pattern, "$1<a href='$2'>$2</a>");
    }
    if ((option['callback'] != null) && typeof option['callback'] === 'function') {
      callbackThunk = option['callback'];
      delete option['callback'];
    }
    for (key in option) {
      value = option[key];
      link_attributes += " " + key + "='" + value + "'";
    }
    return this.replace(url_pattern, function(match, space, url) {
      var link, returnCallback;
      returnCallback = callbackThunk && callbackThunk(url);
      link = returnCallback || ("<a href='" + url + "'" + link_attributes + ">" + url + "</a>");
      return "" + space + link;
    });
  };
  String.prototype['autoLink'] = autoLink;
}).call(this);	
