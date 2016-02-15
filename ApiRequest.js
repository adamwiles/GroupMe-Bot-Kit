// import https module from node
var https = require('https');


/* Sends a post request
 *
 * @param apiPath: string path for api request i.e. '/v3/bots/post'
 * @param message: json object to send 
 * @param responseHandler: a function that handles api response 
 * exports the function as well
 */
exports.sendRequest = function(apiPath, message, responseHandler, type) {

    // response from api
    var response;
    
    // Tell groupme api that request is a post
	var optionsPost = {
		host: "api.groupme.com",
		port: 443,
		path: apiPath, 
		method: type 
	};

    // Create http POST request with message to send to group
	var reqPost = https.request(optionsPost, function(res) {
        var buffer = [];
		res.on('data', function(chunk) {
			buffer.push(chunk);
		}).on('end', function() {
            buffer = Buffer.concat(buffer).toString();
            response = JSON.parse(buffer);
            if (response != undefined) {
                responseHandler(response);
            } else {
                throw "Response undefined"
            }
        });
	});
    
	if (message != undefined) {
        reqPost.write(message); // Send message
    }
	reqPost.end(); // end request
    // print any errors
	reqPost.on('error', function(e) {
		console.error(e);
        response = undefined;
	});
}


