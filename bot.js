var sendRequest  = require('./ApiRequest.js').sendRequest;
var Listener = require('./listener.js').Listener;


/**
 * Creates a bot object that can register in a group
 * and participate in the group chat
 *
 * @param name  : name as will appear in group
 * @param groupId : id of group chat from groupme
 * @param callback : url that will handle messages from group
 * @param avatar : url for image of bot 
 * 
 * groupName : the name of group the bot is registered to
 * botId : id from group me for the bot
 * listeners : an array of Listener
 * NOTES: 
 *       ~ avatar image must be processed by group me
 *       ~ Listener can be seen in listener.js
 */
var Bot = function (name, groupId, callback, avatar) {
    if (name == undefined) {
        throw "Name is required to make a bot"
    }

	this.name = name;
	this.groupId = groupId;;
	this.callback = callback;
	this.avatar = avatar;
	this.groupName = "";
	this.botId = undefined;
    this.listeners = [];
};


/**********
 *  GET   *
**********/

/**
 * Gets the name of the bot to the given name
 */
Bot.prototype.getName = function() { return this.name; }

/**
 * Gets the botId of the bot to the given name
 */
Bot.prototype.getBotId = function() { return this.botId; }

/**
 * Gets the groupId of the bot to the given name
 */
Bot.prototype.getGroupId = function() { return this.groupId; }

/**
 * Gets the callback of the bot to the given name
 */
Bot.prototype.getCallback = function() { return this.callback; }

/**
 * Gets the avatar of the bot to the given name
 */
Bot.prototype.getAvatar = function() { return this.avatar; }

/**
 * Gets the groupName of the bot to the given name
 */
Bot.prototype.getGroupName = function() { return this.groupName; }

/**
 * Gets the listeners of the bot to the given name
 */
Bot.prototype.getListeners = function() { return this.listeners.slice(); }



/**********
 *  SET   *
**********/

/**
 * Sets the name of the bot to the given name
 */
Bot.prototype.setName = function(name) { this.name = name; }

/**
 * Sets the botId of the bot to the given name
 */
Bot.prototype.setBotId = function(botId) { this.botId = botId; }

/**
 * Sets the groupId of the bot to the given name
 */
Bot.prototype.setGroupId = function(groupId) { this.groupId = groupId; }

/**
 * Sets the callback of the bot to the given name
 */
Bot.prototype.setCallback = function(callback) { this.callback = callback; }

/**
 * Sets the avatar of the bot to the given name
 */
Bot.prototype.setAvatar = function(avatar) { this.avatar = avatar; }

/**
 * Sets the groupName of the bot to the given name
 */
Bot.prototype.setGroupName = function(groupName) { this.groupName = groupName; }



/**
 * Registers a bot to a group
 * groupId of bot must be set before register
 * @param token : developer access token
 * NOTE: must register bot before sending messages 
 */
Bot.prototype.register = function(token) {
    if ((!this.groupId) || (!this.name)) {
        throw("bot must have groupId or name to register with");
    } 

    var apiPath = "/v3/bots?token=" + token;

    var register_request = JSON.stringify({
        "bot": {
            "name": this.name,
            "group_id": this.groupId,
            "callback_url": this.callback,
            "avatar_url": this.avatar
        }
    });

    var handleResponse = function(r, bot) {
        // Get registered information for the Bot
        var name       = r.response.bot.name; // bot name
        var new_id     = r.response.bot.bot_id; // bot's id
        var group_name = r.response.bot.group_name; // group name
        var avatar     = r.response.bot.avatar_url; // group name
        var callback   = r.response.bot.callback_url; // group name

        // Update the new registered information for the Bot
        if (name != undefined) { bot.name = name; }
        if (new_id != undefined) { bot.botId = new_id; }
        if (group_name != undefined) { bot.groupName = group_name; }
        if (avatar != undefined) { bot.avatar = avatar; }
        if (callback != undefined) { bot.callback = callback; }

        // Report success and bot information
        console.log("\nSuccess!");
        console.log(bot.name + " registered: ");
        console.log("    Id: " + bot.botId);
        console.log("    group: " + bot.groupName);
        console.log("    avatar: " + bot.avatar);
        console.log("    callback: " + bot.callback);
    }

    sendRequest(apiPath, register_request, handleResponse, "POST", this);
}



/* Sends message to group form the bot
 * message - text to send to group
 * imageUrl - url to send to group
 * NOTE: imageUrl must be a link processed by
 *       group image service
 */
Bot.prototype.sendMessage = function(message, imageUrl) {
    if ((message == undefined) && (imageUrl == undefined)) { 
        throw "Message must contain text or an image link";
    }

    // Json representation of message for group
   	var post = JSON.stringify({
   		"bot_id": this.botId,
   		"text": message
   	});

    var handleResponse = function(r, bot) {
        if (r != undefined) {
            console.log("Message sent!");
        } else {
            console.log("Message Failed.\n" + r);
        }
    }
    sendRequest("/v3/bots/post", post, handleResponse, "POST", this);

};


/*
 * Compares this, Bot, with another bot 
 * @bot : a bot object
 *
 * @return true if this = bot else false 
 */
Bot.prototype.sameBot = function(bot) {
    if (this.botId == bot.botId) {
        return true;
    } else {
        return false;
    }
}

/*
 * Checks if Bot should react to the message
 * if it should calls the reaction 
 * @param message message from the group
 */
Bot.prototype.shouldRespond = function(message) {
    for (var i = 0; i < this.listeners.length; i++) {
        var listen = this.listeners[i];
        if (listen.shouldReact(message)) {
            listen.react(message);
        }
    }
}

/*
 * Adds a listener to a Bot's list of listeners
 * @param phrase string what the bot is listening for
 * @param reaction function of 1 arg, how to react if
 * phrase is in a group message
 */
Bot.prototype.addListener = function(phrase, reaction) {
    var new_listener = new Listener(phrase, reaction, this);

    for (var i = 0; i < this.listeners.length; i++) {    
        if (new_listener.sameListener(this.listeners[i])) {
            throw "Listener already exists";
            return;
        }
    }
    this.listeners.push(new_listener);
}

/*
 * Finds listener based on phrase
 *
 * @param phrase the string which is listener.phrase
 */
Bot.prototype.findListener = function(phrase) {
    var matches = [];

    for (var i = 0; i < this.listeners.length; i++) {
        if (this.listeners[i].phrase == phrase) {
            matches.push(this.listeners[i]);
        }
    }
    if (matches.length == 0) { 
        console.log("No matches found."); 
    } else {
        return matches;
    }
}


/*
 * Removes a listener to a Bot's list of listeners
 * @param listener to remove 
 */
Bot.prototype.removeListener = function(listener) {

    for (var i = 0; i < this.listeners.length; i++) {    
        if (listener.sameListener(this.listeners[i])) {
            this.listeners.splice(i, 1);
            return;
        }
    }
    console.log("Bot does not have listener");
}



// EXPORT NAMED PROTOTYPE BOT
exports.Bot = Bot;
