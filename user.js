var Bot = require('./bot.js').Bot; 
var sendRequest = require('./ApiRequest.js').sendRequest; 


/**
 * Creates a User object that can store all the bots
 * created by a user
 *  
 * @param token : a users access token, from groupme developer page 
 * @param Name: sets the name of the user 
 * bots:   list of bots that belong to the user
 * groups: list of groups that the user belongs to 
 */
var User = function (token, name) {
	this.token = token;
	this.name = name;
    this.bots = [];
    this.groups = [];
};


/**********
 *  GET   *
**********/

/**
 * Gets the token of the user to the given token
 */
User.prototype.getToken = function() { return this.token; }

/**
 * Gets the name of the user to the given name
 */
User.prototype.getName = function() { return this.name; }

/**
 * Gets the list of bots that belong to the user
 */
User.prototype.getBots = function() { return this.bots.slice(); }

/**
 * Gets the list of groups that the user belongs to
 */
User.prototype.getGroups = function() { return this.groups.slice(); }


/**********
 *  SET   *
**********/


/**
 * Sets the token of the user to the given token
 */
User.prototype.setToken = function(token) { this.token = token; }

/**
 * Sets the name of the user to the given name
 */
User.prototype.setName = function(name) { this.name = name; }



/***************
 *  GROUPS     *
***************/

/*
 * Updates the users groups based on groupme's records
 *
 * @param page specific page of groups, defaults to 1
 * @param per_page # of groups per_page, defaults to 15 
 */
User.prototype.getAllGroups = function(page, per_page) {
    if (page == undefined)     { page = 1; }
    if (per_page == undefined) { per_page = 15; }
    
    // url path for api 
    var apiPath = "/v3/groups?token=" + this.token;

    // options for request
    var options = JSON.stringify({
        "page": page,
        "per_page": per_page 
    });

    // function to handle api response
    var handleResponse = function(r, user) {
        if (r == undefined) {
            throw "Bad request"
        }

        var groups_update = [];
        for (var i = 0; i < r.response.length; i++) {
            groups_update.push(r.response[i].id);
        }
        user.groups = groups_update.slice(0);
    }

    sendRequest(apiPath, options, handleResponse, 'GET', this);
}


/*
 * Gets information about group for user
 * @param id groupId for a users group
 * @param callback a function that handles groups info as json
 */
User.prototype.getGroup = function(id, callback) {
    if (id == undefined) { throw "groupId is required" }
    
    // url path for api 
    var apiPath = "/v3/groups?token=" + this.token;

    // options for request
    var options = JSON.stringify({
        "id": id 
    });

    // function to handle api response
    var handleResponse = function(r) {
        callback(r.response);
    }

    sendRequest(apiPath, options, handleResponse, 'GET');
}

/*
 * Find if group is already a User group
 * @param group : Bot object to find
 * @return true if group already exists else false 
 */
User.prototype.groupAlreadyExists = function(groupId) {
    var exists = false;

    // check if group in this.groups
    for (var i = 0; i < this.groups.length; i++) {
        exists = exists || (groupId == this.groups[i]);
    }
    return exists;
}

/*
 * Adds a new group to the list of groups for a user
 * @param groupId: the group id to add the list of groups
 */
User.prototype.addNewGroup = function(groupId) {
    if (!this.groupAlreadyExists(groupId)) {
        this.groups.push(groupId);
    } else {
        throw "Group already exists"
    }
}


/* Starts server and listens for callback of group messages 
 * from group me
 * NOTE: bots must be registered to server where this
 *       script is running
 * 
 * @param callback : function that takes two arguments
 *                   (1) the json object sent from groupme
 *                   (2) the user who called the funciton
 */
User.prototype.startServer = function(callback) {

    function requestListener(request, response) {
    
        request.on('data', function(data) {
            var message = JSON.parse(data, null, 4); 
            
            callback(message, user);
        }); 
    }

    var server = http.createServer(requestListener);
    
    server.listen(80);
    
    server.on('connection', function (stream) { });
}




/*
 * Deletes a group and removes it from a User groups
 *
 * @param name name of the group
 * @param description text of the group 
 * @param image_url link to image *from groupme image service* 
 * NOTE: name is required
 */
User.prototype.deleteGroup = function(id) {
    if (id == undefined) {
        throw "must specify which group to delete"
    }

    // url path for api 
    var apiPath = "/v3/groups/" + id  + "/destroy?token=" + this.token;

    // function to handle api response
    var handleResponse = function(r, user) {
        console.log(r);
        if (!user.groupAlreadyexists(r.response.id)) {
            user.groups.splice(user.groups.indexOf(r.response.id), 1);
        } else {
            throw "group already exists"
        } 
    }

    sendRequest(apiPath, undefined, handleResponse, 'POST', this);
}





/***************
 *    BOTS     *
***************/


/*
 * Gets all the bots for user from GroupMe's records
 * @param page specific page of bots, defaults to 1
 * @param per_page # of bots per_page, defaults to 15
 */
User.prototype.refreshBots = function() {
    
    // url path for api 
    var apiPath = "/v3/bots?token=" + this.token;

    // function to handle api response
    var handleResponse = function(r, user) {
        if (r.response == undefined) {
            throw "Bad request"
        }

        var bots_refresh = [];
        for (var i = 0; i < r.response.length; i++) {
            var b = r.response[i];
            var new_bot = new Bot(b.name, b.group_id);
            new_bot.setBotId(b.bot_id);
            if (!user.botAlreadyExists(new_bot)) {
                bots_refresh.push(new_bot);
            } else {
                var update_bot = user.getBot(b.bot_id);
                update_bot.setName(b.name); 
                update_bot.setGroupId(b.group_id); 
                update_bot.setGroupName(b.group_name); 
                update_bot.setCallback(b.callback_url); 
                update_bot.setAvatar(b.avatar_url); 
            }
        }
        user.bots = bots_refresh.slice(0);
    }

    sendRequest(apiPath, undefined, handleResponse, 'GET', this);
}

/*
 * Adds a new bot to the list of bots for a user
 */
User.prototype.addNewBot = function(bot) {
    if (!this.botAlreadyExists(bot)) {
        this.bots.push(bot);
    } else {
        throw "Bot already exists"
    }
} 

/*
 * Returns the bot with the given botId
 */
User.prototype.getBot = function(id) {
    for (var i = 0; i < this.bots.length; i++) {
        if (this.bots[i].botId == id) {
            return this.bots[i];
        }
    }
    console.log("Bot does not exist");
}

/*
 * Find if bot is already a User bot
 * @param bot : Bot object to find
 * @return true if bot already exists else false 
 */
User.prototype.botAlreadyExists = function(bot) {
    var exists = false;

    // check if bot in this.bots
    for (var i = 0; i < this.bots.length; i++) {
        exists = exists || this.bots[i].sameBot(bot);
    }
    return exists;
}

// EXPORT NAMED PROTOTYPE USER
exports.User = User;
