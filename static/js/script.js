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
		if (option == "word_phrase") {
			$("#inputarea").show();
		} else {
			$("#inputarea").hide();
		}
	})

	$("#submitbutton").click(function() {
		clear_canvas();
		var xaxis = $("#xaxis").val();
		var yaxis = $("#yaxis").val();
		var text = $("#inputarea").val();
		$("#viz_title").html(text)
		$.post("/freq_by_time", {"text": text}, function(data) {
			freq_to_time(JSON.parse(data));
		});
	})

});