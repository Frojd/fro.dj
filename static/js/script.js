jQuery(function($){
	var submit = $('#submit'),
		url = $('#url'),
		alias = $('#alias'),
		result = $('#result'),
		arrow = $('#toggleAlias');

	// Hide alias input and show when arrow is clicked
	alias.parent().hide();
	
	arrow.click(function(e){
		arrow.toggleClass('active');
		alias.parent().slideToggle();
	});

	// Handle form submission
	submit.click(function(e){
		var urlString = validateUrl(url)
			aliasString = validateAlias(alias);

		e.preventDefault();

		if( urlString ){
			$.ajax({
				url: '/mini/' + encodeURIComponent(urlString) + (aliasString && '/' + aliasString),
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
		else {
			result
				.addClass('error')
				.html('Invalid url');
		}
	});

	function error(){
		var text;

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

	function validateUrl(elem){
		var url = elem.val();

		if( url !== '' ){
			// Not contains spaces and is longer than one character
			url = ( url.indexOf(' ') === -1 && url.length > 1 )
				? url
				: '';

			// If url contains no protocol, prepend http:// and show it in the UI so the user knows what will be shortened
			if( url !== '' && url.indexOf('://') <= 0 ){
				url = 'http://' + url;
				elem.val(url);
			}
		}

		return url;
	}
	function validateAlias(elem){
		var alias = elem.val();

		if( alias !== '' ){
			alias = alias.match(/[^a-zA-Z0-9]/) ? '' : alias;
		}

		return alias;
	}
});