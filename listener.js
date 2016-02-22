/*
 * A listener is used for bots to respond to a group
 *
 * @param phrase    string : to check for in a message
 * @param reaction  function : how the bot should react to the phrase
 * @param bot       Bot : the bot to react 
 * Note: a reaction should be a 1 argument function that
 * takes in a string, which is the message
 */
var Listener = function(phrase, reaction, bot) {
    this.phrase = phrase;
    this.reaction = reaction;
    this.bot = bot;
}


/*
 * returns the value of the phrase
 */
Listener.prototype.getPhrase = function() { return this.phrase; }

/*
 * returns the value of the phrase
 * @param message string of group message
 */
Listener.prototype.react = function(message) { return this.reaction(message); }

/*
 * returns true if message cotains the listeners phrase else false
 * @param message string of group message
 */
Listener.prototype.shouldReact = function(message) {
    return message.indexOf(this.phrase) > 0;
}

/*
 * tells if two listeners are the same
 * a listener to compare to this listener
 */
Listener.prototype.sameListener = function(listener) {
    return ((this.phrase == listener.phrase) &&
            (this.reaction.toString() == listener.reaction.toString()));
}


// EXPORT LISTENER
exports.Listener = Listener;
