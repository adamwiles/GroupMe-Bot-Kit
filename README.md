# GroupMe-Bot-Kit
A GroupMe API wrapper that combined with node js allows for easy creation and use of GroupMe bots.
This wrapper can create a bot and send a message in 3 lines of code, with an access token and a
group id. Access tokens and group ids can be found on the GroupMe developer website.

#Prerequisites
To use GroupMe-Bot-Kit:
   - node.js must be installed
   - must have a GroupMe api user token, can get at (https://dev.groupme.com/)

#Getting Started

###Creating your first Bot 
Create new bot with name and group id for which group the bot should send messages.
Register the bot to the group with GroupMe (This will also give the bot an Id).
Send a message to the group

```javascript
var bot = new Bot("Name", GROUP_ID);
bot.register(USER_TOKEN);
bot.sendMessage("Test Message");
```

#User

###About
A user represents a GroupMe user with a given user token.
The user class stores all of the bots created by the GroupMe user and
all of the GroupMe user's groups.  

###Create a User
Create a new user with a name and a user token, the token from prerequisites.

```javascript
var user = new User("Name", USER_TOKEN);
```

###Fields
User fields:
    * name:   the name of the user
    * token:  the user token
    * bots:   an array of bots that belong to the user
    * groups: an array of the groups the user belongs to 


#Bots

###About
A bot represents a nonreal user added to a group. The bot can send messages
to the group and can recieve copy of all group interactions (messages, likes, photos).
The bot also has a listen of listeners, which allow it to react to group interactions.

###Create a Bot
How to create a bot can be seen in getting started, but for the sake
of consistency I will add how to create a bot below as well.

```javascript
var bot = new Bot("Name", GROUP_ID);
```

###Fields
Bot fields 
    * name      : (required) bots name required to create the bot 
    * groupId   : group bot belongs too required to send messages to a group
    * avatar    : url to bot's picture (must go through GroupMe's image service)
    * callback  : url that will recieve a copy of all message sent to bots group
    * groupName : the name of group the bot belongs to
    * botId     : the id of the bot, assigned from GroupMe's API
    * listeners : an array of all of the bots listeners

#Listeners

###About
A Listener represents an automated action for a bot. Listeners are associated
with a bot and have a phrase and a reaction. Listeners can be used to react
to certain phrases in a group


###Create a Listener

```javascript
var listener = new Listener("name",
                            function (message) { console.log(message;) },
                            bot);
```

###Fields
Listener fields
    * phrase:   a string to check for in a message
    * reaction: a function that takes the only message(string) as an argument 
    * bot:      the bot associated with the listener
