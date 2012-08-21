jQuery(function($){
	var suggest = $('#suggestion'),
		alias = $('#alias'),
		path;

	// Show alias box //##??
	alias.parent().show();

	// Get alias from url
	path = document.location.pathname;
	path = path.substring(path.lastIndexOf('/') + 1);

	// Set alias value
 	alias.val(path);

 	// Set h2 value
 	suggest.html(path);
});