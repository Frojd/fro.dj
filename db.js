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
	 * Recieves a long url, generates an alias, puts them to the database and
	 * returns the alias.
	 *
	 * @param url
	 * @param callback
	 *
	 * @callback
	 	* @param err string, null if no error
	 	* @param alias string, sortened path (eg Le3t)
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
					// No error, assume new entry was inserted and return alias
					callback(null, doc.alias);
				}
				else {
					// Other error, abort
					callback(err, data);
				}
			});
		})(collection, url, 0);
	}

	/** setCustom
	 * 
	 * Puts a long url and an alias to the database, if not already used
	 *
	 * @param url string The url to be shortened
	 * @param alias string The desired alias. Only path, no domain!
	 *
	 * @callback
	 	* @param err object, null if no error
	 	* @param alias string, sortened url
	 */
	this.setCustom = function(url, alias, callback){
		insert({alias: alias, url: url}, function(err, data){
			if( !err ){
				callback(null, alias);
			}
			if( err && err.code === 11000 ){
				// Duplicate key, alias already exists
				callback({code: 11000, err: 'Alias is unavailable'});
			}
			else {
				// Other error, abort
				callback(err, data);
			}
		});
	}

	/* Private methods */
	
	/** insert
	 *
	 * Insert a document into this object's collection.
	 *
	 * @param doc required Document to be inserted in the database
	 *
	 * @callback
	 	* @param err object, null if no error
	 	* @param data object, data returned from mongodb
	 */
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

	/** generateAlias
	 *
	 * Generates a random string that's half as many bytes as i long.
	 *
	 * @param i int required Preferably used to count how many iterations the generation has been tried
	 */
	function generateAlias(i){
		var charSet = ['0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'],
			result = '',
			k,
			reps = Math.floor(i/2);
		
		for( k = 0; k <= reps; k++ ){
			result += charSet[Math.floor(Math.random()*charSet.length)];
		}

		return result;
	}
}

module.exports = function(vars){
	return new DB(vars);
};