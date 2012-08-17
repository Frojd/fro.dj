jQuery(function($){
	var submit = $('#submit'),
		url = $('#url'),
		alias = $('#alias'),
		result = $('#result');

	submit.click(function(e){
		e.preventDefault();

		if( url.val() !== "" ){
			$.ajax({
				url: '/mini/' + encodeURIComponent(url.val()) + (alias.val() && '/' + alias.val()),
				dataType: 'json',
				success: function(data){
					if( !data.error && data.alias ){
						result
							.removeClass('error')
							.html('<a href="' + location.protocol + '//' + location.host + '/' + data.alias + '">' + location.protocol + '//' + location.host + '/' + data.alias + '</a>');
					}
					else {
						error(data);
					}
				},
				error: error
			});
		}
	});

	function error(){
		var text;
console.log('error: ', arguments);
		if( arguments[0].status === 409 ){
			text = 'Alias is already taken';
		}
		else {
			text = 'Something went wrong';
		}

		result
			.addClass('error')
			.html(text);
	}
});