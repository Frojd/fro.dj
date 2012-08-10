// Get dependencies
var mongo = require('mongo');

/** DB
 *
 * @param vars
 	* db: (mongodb database)
 	* collection: 'urls'
 */
function DB(vars){
	// Default private properties
	var i,
		settings = {
			db: null,
			collection: 'urls'
		},
		vars = vars || {};

	// Abort if db is not set
	if( !vars.db ){
		throw 'ERROR: no database';
	}
	// Extend vars into settings
	for( i in vars ){
		settings[i] = vars[i];
	}

	/** set
	 * 
	 * Recieves a long url and returns the short one
	 *
	 * @param url
	 * @param callback
	 *
	 * @callback
	 	* @param err string, null if no error
	 	* @param shortUrl string, sortened url
	 */
	this.set = function(url, callback){
		// Try to insert a random alias
		(function tryInsert(collection, url, i){
			var doc = {alias: generateAlias(i), url: url};

			insert(doc, function(err, data){
				if( err && err.code === 11000 ){
					// Duplicate key, try again
					tryInsert(collection, url, i++);
				}
				else if( !err ){
					callback(null, doc.alias);
				}
				else {
					callback(err, data);
				}
			});
		})(collection, url, 0);
	}

	/** setCustom
	 * 
	 * Puts a long url and a short url to the database, if not already used
	 *
	 * @param longUrl
	 * @param shortUrl
	 * @param callback
	 *
	 * @callback
	 	* @param err string, null if no error
	 	* @param shortUrl string, sortened url
	 */
	this.setCustom = function(longUrl, shortUrl, callback){
		// Connect to database
		db.collection(settings.collection, function(err, collection){
			if( !err ){
			}
		});
	}

	/* Private methods */
	
	function insert(doc, callback){
		// Connect to database
		db.collection(settings.collection, function(err, collection){
			if( !err ){
				collection.ensureIndex({alias: 1}, {unique: true});

				collection.insert(doc, {safe: true}, function(err, data){
					callback(err, data);
				});
			}
			else {
				callback(err, collection);
			}
		});
	}

	function generateAlias(i){
		var charSet = ['0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'],
			result = '',
			k,
			reps = Math.floor(i/2);
		
		for( k = 0; k <= reps; k++ ){
			result += charSet[Math.floor(Math.random()*60)];
		}

		return result;
	}
}

module.exports = function(vars){
	return new DB(vars);
};