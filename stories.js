(function() {
	var template = Handlebars.compile($('#tplStory').html());
	var endpoint = "http://dailyemerald.com/topics/fiesta-bowl-2012";

	var formatDate = function(d) {
		var curr_date = d.getDate();
		var curr_month = d.getMonth() + 1; //Months are zero based
		var curr_year = d.getFullYear();
		return curr_date + "-" + curr_month + "-" + curr_year;
	}

	$.ajax({
	  url: endpoint+"/json/?callback=?",
	  dataType: 'jsonp',
	  success: function(data){
		//console.log("stories:", data);

	    data.forEach(function(story){
			story.timestamp = moment( story.date.split(" ").join("T") + "-08:00" );
			story.date = story.timestamp.format("dddd, MMMM Do") + " at " + story.timestamp.format("h:mm a");
			$(".story-list").append(template(story));		
		});	
	
	  }
	});
})();