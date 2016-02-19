# GroupMe-Bot-Kit
A GroupMe api wrapper that combined with node js allows for easy creation and use of GroupMe bots.
This wrapper can create a bot and send a message in 3 lines of code, with an access token and a
group id. Access tokens and group ids can be found on the GroupMe developer website.

#Prerequisites
To use GroupMe-Bot-Kit node.js must be installed


#Getting Started
Steps to get a bot up and running

###Create a Bot
To create a new bot:
- Name : bots name required to create the bot 
- GroupId : required to send messages to a group
- Avatar: url to bot's picture (must go through GroupMe's image service)
- Callback: url that will recieve a copy of all message sent to bots group

'''
var bot = new Bot("Name", GROUP_ID);
bot.register(USER_TOKEN);
bot.sendMessage("Test Message");
'''


