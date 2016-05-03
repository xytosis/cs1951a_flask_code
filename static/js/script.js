$(document).ready(function() {

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
		var xaxis = $("#xaxis").val();
		var yaxis = $("#yaxis").val();
		var text = $("#inputarea").val();
		$.post("/freq_by_time", {"text": text}, function(data) {
			alert(data);
		});
	})

});