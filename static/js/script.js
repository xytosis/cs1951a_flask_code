$(document).ready(function() {

	$('#samplebox').click(function() {
    	if($("#samplebox").is(':checked')){
    		$("#sample_stuff").show()
    	}
		else {
    		$("#sample_stuff").hide()
		}
	});

});