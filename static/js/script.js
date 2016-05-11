$(document).ready(function() {

	function clear_canvas() {
		$("#main_viz").html("");
	}

	$('#samplebox').click(function() {
    	if($("#samplebox").is(':checked')){
    		$("#main_stuff").hide()
    		$("#sample_stuff").show()
    	}
		else {
    		$("#sample_stuff").hide()
    		$("#main_stuff").show()
		}
	});

	$("#yaxis").change(function() {
		var option = $(this).val();
		if (option == "word_phrase_karma_subreddit" || 
			option == "word_phrase_sentiment" || 
			option == "karma_predict" || 
			option == "word_phrase" || 
			option == "word_phrase_subreddit" || 
			option == "word_phrase_karma" ||
			option == "sentiment") {
			$("#phrasediv").show();
		} else {
			$("#phrasediv").hide();
		}

		if (option == "subreddit_popularity" ||
			option == "sentiment") {
			$("#subredditdiv").show();
		} else {
			$("#subredditdiv").hide();
		}
	})

	$("#submitbutton").click(function() {
		clear_canvas();
		var yaxis = $("#yaxis").val();
		var text = $("#phrasetext").val();
		var subreddit = $("#subreddittext").val();
		$("#viz_title").html("Query: " + text)
		if (yaxis == "word_phrase") {
			$.post("/freq_by_time", {"text": text}, function(data) {
				freq_to_time(JSON.parse(data));
			});
		}

		if (yaxis == "word_phrase_subreddit") {
			$.post("/freq_by_subreddit", {"text":text}, function(data) {
				freq_by_subreddit(JSON.parse(data));
			});
		}

		if (yaxis == "word_phrase_karma") {
			$.post("/karma_stats", {"text":text}, function(data) {
				karma_stats(JSON.parse(data));
			});
		}

		if (yaxis == "karma_predict") {
			$.post("/karma_predict", {"text":text}, function(data) {
				karma_predict(JSON.parse(data));
			});
		}

		if (yaxis == "word_phrase_sentiment") {
			$.post("/word_phrase_sentiment", {"text":text}, function(data) {
				word_phrase_sentiment(JSON.parse(data));
			});
		}

		if (yaxis == "word_phrase_karma_subreddit") {
			$.post("/word_phrase_karma_subreddit", {"text":text}, function(data) {
				word_phrase_karma_subreddit(JSON.parse(data));
			});
		}
		if (yaxis == "subreddit_popularity"){
			$.post("/subreddit_popularity", {"subreddit":subreddit}, function(data) {
				subreddit_popularity(JSON.parse(data));
			});
		}

		if (yaxis == "sentiment"){
			$.post("/sentiment", {"text":text,"subreddit":subreddit}, function(data) {
				sentiment(JSON.parse(data));
			});
		}
	})

});