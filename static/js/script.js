$(document).ready(function() {

	function clear_canvas() {
		$("#main_viz").html("");
	}

	$("#yaxis").change(function() {
		$(".explanations").hide();
		$(".inputdiv").hide();
		$("#query-fields").show();
		$("#yaxis").css('font-weight', 'bold');

		var option = $(this).val();
		if (option == "word_phrase_karma_subreddit" || 
			option == "karma_predict" || 
			option == "word_phrase" || 
			option == "word_phrase_subreddit" || 
			option == "word_phrase_karma" ||
			option == "sentiment" ||
			option == "sentiment_by_subreddit") {
			$("#phrasediv").show();

			if (option == "word_phrase_karma_subreddit") {
				$("#KarmaVsSubredditExplanation").show();
			}
			if (option == "karma_predict") {
				$("#KarmaPredictExplanation").show();
			}
			if (option == "word_phrase"){
				$("#WordVsTimeExplanation").show();
			}
			if (option == "word_phrase_subreddit"){
				$("#WordVsSubredditExplanation").show();
			}
			if (option == "word_phrase_karma"){
				$("#WordVsKarmaExplanation").show();
			}
			if (option == "sentiment") {
				$("#SentimentByTimeExplanation").show();
			}
			if (option == "sentiment_by_subreddit") {
				$("#SentimentBySubredditExplanation").show();
			}
		} 

		if (option == "subreddit_popularity" ||
			option == "sentiment" ||
			option == "topic_modeling") {
			$("#subredditdiv").show();
			if (option == "subreddit_popularity") {
				$("#SubredditPopularityExplanation").show();
			}
			if (option == "topic_modeling") {
				$("#TopicModelingExplanation").show();
			}
		} 

		if (option == "reading_level") {
			$("#yeardiv").show();
			$("#ReadingLevelExplanation").show();
		} 
		if (option == "topic_modeling") {
			$("#yeardiv").show();
		} 
		if (option == "sentiment_by_subreddit") {
			$("#yeardiv").show();
		}

		if (option == "wordcount") {
			$("#yeardiv").show();
			$("#subredditdiv").show();
			$("#WordcountExplanation").show();
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
		$("#introduction").hide();
		var yaxis = $("#yaxis").val();
		var text1 = $("#phrasetext").val();
		var text2 = $("#subreddittext").val();
		var text3 = $("#yeartext").val();
		if (text2 != "") {
			text1 += ", " + text2;
		}
		if (text3 != "") {
			text1 += ", " + text3;
		}
		if (text1[0] == ",") {
			text1 = text1.substring(1, text1.length);
		}
		var text = $("#phrasetext").val();
		var subreddit = $("#subreddittext").val();
		var year = $("#yeartext").val();
		$("#viz_title").html("Query: " + text1)
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
				linechart(JSON.parse(data), false, false, "karma", "number of comments");
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
				barchart(JSON.parse(data), "subreddit", "average karma", true);
			});
		}
		if (yaxis == "subreddit_popularity"){
			$.post("/subreddit_popularity", {"subreddit":subreddit}, function(data) {
				$("#loading").hide()
				linechart(JSON.parse(data), true, false, "time", "percentage of comments");
			});
		}

		if (yaxis == "sentiment"){
			$.post("/sentiment", {"text":text,"subreddit":subreddit}, function(data) {
				$("#loading").hide()
				linechart(JSON.parse(data), false, true, "time", "sentiment");
			});
		}
		if (yaxis == "sentiment_by_subreddit"){
			console.log("here")
			$.post("/sentiment_by_subreddit", {"text":text,"year":year}, function(data) {
				$("#loading").hide()
				barchart(JSON.parse(data), "subreddit", "sentiment");
			});
		}



		if (yaxis == "reading_level"){
			$.post("/reading_level", {"year":year}, function(data) {
				$("#loading").hide()
				barchart(JSON.parse(data), "subreddit", "reading level", true);
			});
		}

		if (yaxis == "topic_modeling"){
			$.post("/topic_modeling", {"subreddit": subreddit, "year":year}, function(data) {
				$("#loading").hide()
				topic_modeling(JSON.parse(data), text1);
			});
		}

		if (yaxis == "wordcount"){
			$.post("/wordcount", {"year":year, "subreddit":subreddit}, function(data) {
				$("#loading").hide()
				console.log("EREHRERJELRKERH")
				wordcount(JSON.parse(data));
			});
		}
		$("#phrasetext").val("");
		$("#subreddittext").val("");
		$("#yeartext").val("");
	}

});
