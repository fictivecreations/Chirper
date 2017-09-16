var chirpTemplate;

//Once Document Loads
$( document ).ready(function(){
	getUserData("chirpsatme");

	$("#header a").click(function(e){
		var $target = $(e.target);
		var chirper = $target.parent()[0].id;
		var $old = $("#header a.current").parent();
		
		//Don't want to do anything if we're already on the one clicked
		if(chirper !== $old[0].id){
			$("#header a").removeClass("current");
			$target.addClass("current");

			getUserData(chirper);
		}
	});

	$(".compose input").on('keyup', function (e) {
	    if (e.keyCode == 13) {
	        postTweet($(e.target).val());
	        $(e.target).val("");
	    }
	});

	$(".search-bar-container input").on('keyup', function (e) {
	    if (e.keyCode == 13) {
	    	var val = $(e.target).val();
	        if(val.length > 0)
	        	search(val);
	        else
	        	getUserData($("#header a.current").parent()[0].id);
	    }
	});

})


$.get('item-template.handlebars', function (data) {
	chirpTemplate = Handlebars.compile(data);
}, 'html');



var getUserData = function (user) {
	$.ajax({
		type: "POST",
		url: '/twitter/user',
		data: {username : user},
		success: function(json){
			var data = $.parseJSON(json.result.userData);
			var mostRecentStatusId = data.status.id;

			$("#chirps-count .data").html(data.statuses_count);
			$("#follow-count .data").html(data.friends_count);
			$("#followers-count .data").html(data.followers_count);
			$(".header-img").css("background-color", "#" + data.profile_background_color);
			if(data.profile_background_image_url !== null) 
				$(".header-img").css("background-image", 'url(' + data.profile_background_image_url_https + ')');
			$(".profile-img").css("background-image", 'url(' + data.profile_image_url_https.replace("normal", "bigger") + ')');
		},
		error: function(err){
			console.log(err);
		}
	});


	//Clear out old tweets
	$("#chirp-content").html("")

	$.ajax({
		type: "POST",
		url: '/twitter/tweets',
		data: {
			username : user,
		},
		success: function(json){
			var data = $.parseJSON(json);

			data.forEach(function(item){
				var chirpTime = new Date(Date.parse(item.created_at));
				$("#chirp-content").append(chirpTemplate({
					chirpImage: item.user.profile_image_url_https,
					chirpUsername: item.user.name,
					chirpUser: "@" + item.user.screen_name,
					time: chirpTime.toLocaleString("en-us", { month: "short" }) 
						+ " " + chirpTime.getDate(),
					chirpText: item.text
				}));
			});
		},
		error: function(err){
			console.log(err);
		}
	});
};

var postTweet = function(status){
	var user = $("#header a.current").parent()[0].id;
	var post = $.ajax({
		type: "POST",
		url: '/twitter/status',
		data: {
			username : user,
			status: status
		},
		success: function(json){
			var data = $.parseJSON(json);
		},
		error: function(err){
			console.log(err);
		}
	});

	//Update Tweets
	$.when(post).done(function(){getUserData(user)});
}

var search = function(searchquery){
	var user = $("#header a.current").parent()[0].id;
	var post = $.ajax({
		type: "POST",
		url: '/twitter/filter',
		data: {
			username : user,
			filter: searchquery
		},
		success: function(json){
			$("#chirp-content").html("")

			var data = $.parseJSON(json).statuses;

			data.forEach(function(item){
				var chirpTime = new Date(Date.parse(item.created_at));
				$("#chirp-content").append(chirpTemplate({
					chirpImage: item.user.profile_image_url_https,
					chirpUsername: item.user.name,
					chirpUser: "@" + item.user.screen_name,
					time: chirpTime.toLocaleString("en-us", { month: "short" }) 
						+ " " + chirpTime.getDate(),
					chirpText: item.text
				}));
			});
		},
		error: function(err){
			console.log(err);
		}
	});
}