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
		$(".explanations").hide();

		var option = $(this).val();
		if (option == "word_phrase_karma_subreddit" || 
			option == "karma_predict" || 
			option == "word_phrase" || 
			option == "word_phrase_subreddit" || 
			option == "word_phrase_karma" ||
			option == "sentiment") {
			console.log("pressed this")
			$("#phrasediv").show();

			if (option == "word_phrase_karma_subreddit") {
				$("#KarmaVsSubredditExplanation").show();
			}
			if (option == "karma_predict") {
				$("#KarmaPredictExplanation").show();
			}
			if (option == "word_phrase"){
				console.log("pressed this2");
				$("#WordVsTimeExplanation").show();
			}
			if (option == "word_phrase_subreddit"){
				$("#WordVsSubredditExplanation").show();
			}
			if (option == "word_phrase_karma"){
				$("#WordVsKarmaExplanation").show();
			}
			if (option == "sentiment") {
				$("#SentimentVsSubredditExplanation").show();
			}

		} else {
			$("#phrasediv").hide();
		}

		if (option == "subreddit_popularity" ||
			option == "sentiment") {
			$("#subredditdiv").show();
			if (option == "subreddit_popularity") {
				$("#SubredditPopularityExplanation").show();
			}
		} else {
			$("#subredditdiv").hide();
		}

		if (option == "reading_level") {
			$("#yeardiv").show();
			$("#ReadingLevelExplanation").show();
		} else {
			$("#yeardiv").hide();
		}
	})

	$("#submitbutton").click(function() {
		submitFunction();
	});

	$(".textbox").keypress(function (e) {
	  if (e.which == 13) {
	    submitFunction();
	    return false;
	  }
	});

	function submitFunction() {
		clear_canvas();
		var yaxis = $("#yaxis").val();
		var text = $("#phrasetext").val();
		var text2 = $("#subreddittext").val();
		var text3 = $("#yeartext").val();
		if (text2 != "") {
			text += ", " + text2;
		}
		if (text3 != "") {
			text += ", " + text3;
		}
		if (text[0] == ",") {
			text = text.substring(1, text.length);
		}
		var subreddit = $("#subreddittext").val();
		var year = $("#yeartext").val();
		$("#viz_title").html("Query: " + text)
		$("#loading").show()
		if (yaxis == "word_phrase") {
			$.post("/freq_by_time", {"text": text}, function(data) {
				$("#loading").hide()
				freq_to_time(JSON.parse(data));
			});
		}

		if (yaxis == "word_phrase_subreddit") {
			$.post("/freq_by_subreddit", {"text":text}, function(data) {
				$("#loading").hide()
				freq_by_subreddit(JSON.parse(data));
			});
		}

		if (yaxis == "word_phrase_karma") {
			$.post("/karma_stats", {"text":text}, function(data) {
				$("#loading").hide()
				karma_stats(JSON.parse(data));
			});
		}

		if (yaxis == "karma_predict") {
			$.post("/karma_predict", {"text":text}, function(data) {
				$("#loading").hide()
				karma_predict(JSON.parse(data));
			});
		}

		if (yaxis == "word_phrase_karma_subreddit") {
			$.post("/word_phrase_karma_subreddit", {"text":text}, function(data) {
				$("#loading").hide()
				word_phrase_karma_subreddit(JSON.parse(data));
			});
		}
		if (yaxis == "subreddit_popularity"){
			$.post("/subreddit_popularity", {"subreddit":subreddit}, function(data) {
				$("#loading").hide()
				subreddit_popularity(JSON.parse(data));
			});
		}

		if (yaxis == "sentiment"){
			$.post("/sentiment", {"text":text,"subreddit":subreddit}, function(data) {
				$("#loading").hide()
				sentiment(JSON.parse(data));
			});
		}

		if (yaxis == "reading_level"){
			$.post("/reading_level", {"year":year}, function(data) {
				$("#loading").hide()
				reading_level(JSON.parse(data));
			});
		}
		$("#phrasetext").val("");
		$("#subreddittext").val("");
		$("#yeartext").val("");
	}

});