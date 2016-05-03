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

});