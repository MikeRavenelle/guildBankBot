const Discord = require('discord.js');
const bot = new Discord.Client();
const CONFIG = require('./config.json');

var _guildName = "Set your guild name";
var _board = new Array();
var globalMessageTest;

var ItemEntry = function (itemName, amount) {
    this._name = itemName;
    this._amount = amount;
    this._assigned = new Array();
}

bot.on('ready', () => {
    bot.user.setStatus('online');
    bot.user.setActivity("!gbb_help for help");
    console.log(`Logged in as ${bot.user.tag}`);
});

bot.login(CONFIG.token);

bot.on('message', message => {
    let msg = message.content;
    globalMessageTest = message;
    if (msg.substring(0, 1) === '!') {
        let args = msg.substring(1).match(/"[^"]*"|\S+/g).map(m => m.slice(0, 1) === '"' ? m.slice(1, -1) : m);
        let cmd = args[0];
        let param1 = args[1];
        let param2 = args[2];
        let output = "";
        let elevatedPermission = message.member.hasPermission("MANAGE_CHANNELS");

        switch (cmd) {
            case 'gbb_guild':
                output = GuildName(elevatedPermission, param1);
                break;
            case 'assign':
                output = AssignItem(elevatedPermission, param1, param2);
                break;
            case 'signup':
                output = Signup(message.member.displayName, param1);
                break;
            case 'withdraw':
                output = Withdraw(message.member.displayName, param1);
                break;
            case 'unassign':
                output = UnassignItem(elevatedPermission, param1, param2);
                break;
            case 'assigned':
                output = Assigned(message.member.displayName, param1);
                break;
            case 'add':
                output = Add(elevatedPermission, param1, param2);
                break;
            case 'remove':
                output = Remove(elevatedPermission, param1);
                break;
            case 'amount':
                output = ChangeAmount(elevatedPermission, param1, param2);
                break;
            case 'board':
                output = ShowBoard();
                break;
            case 'gbb_help':
                output = Help();
                break;
        }

        if (output.length > 0)
            message.reply(output);
    }
});

function GuildName(elevatedPermission, guildName) {
    let output = "";

    if (elevatedPermission) {
        _guildName = guildName;
        output = "guild name set to " + _guildName + ".";
    }
    else {
        output = "you do not have permission to do that. Tsk Tsk. Shame.";
    }

    return output;
}

function Add(elevatedPermission, item, value) {
    let output = "";

    if (elevatedPermission) {
        let itemFound = false;
        for (let i = 0; i < _board.length; ++i) {
            if (_board[i]._name === item) {
                itemFound = true;
                break;
            }
        }

        if (!itemFound) {
            if (!isNaN(value)) {
                _board.push(new ItemEntry(item, value));
                output = item + " has been added to the board with a needed amount of " + value + ".";
            }
            else {
                output = value + " is not a valid number.";
            }
        }
        else {
            output = item + " already exists on the board.";
        }
    }
    else {
        output = "you do not have permission to do that. Tsk Tsk. Shame.";
    }

    return output;
}

function Remove(elevatedPermission, item) {
    let output = "";

    if (elevatedPermission) {
        let itemDeleted = false;
        for (let i = 0; i < _board.length; ++i) {
            if (_board[i]._name === item) {
                _board.splice(i, 1);
                itemDeleted = true;
                break;
            }
        }

        if (itemDeleted) {
            output = item + " has been deleted from the board.";
        }
        else {
            output = item + " does not exist on the board.";
        }
    }
    else {
        output = "you do not have permission to do that. Tsk Tsk. Shame.";
    }

    return output;
}

function AssignItem(elevatedPermission, item, name) {
    let output = "";

    if (elevatedPermission) {
        let itemAssigned = false;
        for (let i = 0; i < _board.length; ++i) {
            if (_board[i]._name === item) {
                _board[i]._assigned.push(name);
                itemAssigned = true;
                break;
            }
        }

        if (itemAssigned) {
            output = name + " has been assigned to " + item + ".";
        }
        else {
            output = item + " does not exists on the board.";
        }
    }
    else {
        output = "you do not have permission to do that. Tsk Tsk. Shame.";
    }

    return output;
}

function UnassignItem(elevatedPermission, item, name) {
    let output = "";

    if (elevatedPermission) {
        let unAssigned = false;
        let itemFound = false;
        for (let i = 0; i < _board.length; ++i) {
            if (_board[i]._name === item) {
                for (let j = 0; j < _board[i]._assigned.length; ++j) {
                    if (_board[i]._assigned[j] === name) {
                        _board[i]._assigned.splice(j, 1);
                        unAssigned = true;
                        break;
                    }
                }
                itemFound = true;
                break;
            }
        }

        if (unAssigned && itemFound) {
            output = name + " has been unassigned from " + item + ".";
        }
        else if (!unAssigned && itemFound) {
            output = name + " is not assigned to " + item + ".";
        }
        else if (!unAssigned && !itemFound || !itemFound) {
            output = item + " does not exists on the board.";
        }
    }
    else {
        output = "you do not have permission to do that. Tsk Tsk. Shame.";
    }

    return output;
}

function Assigned(name) {
    let output = "";
    for (let i = 0; i < _board.length; ++i) {
        for (let j = 0; j < _board[i]._assigned.length; ++j) {
            if (_board[i]._assigned[j] === name) {
                output += "\r\n " + _board[i]._name + " ";
            }
        }
    }

    if (output.length === 0) {
        output = "you are currently not assigned to any items."
    }

    return output;
}

function ChangeAmount(elevatedPermission, item, value) {
    let output = "";

    if (elevatedPermission) {
        let itemUpdated = false;
        for (let i = 0; i < _board.length; ++i) {
            if (_board[i]._name === item) {
                if (!isNaN(value)) {
                    _board[i]._amount = value;
                    itemUpdated = true;
                }
                break;
            }
        }

        if (itemUpdated) {
            output = item + " has been updated to " + value + ".";
        }
        else if (!itemUpdated && !isNaN(value)) {
            output = item + " does not exists on the board.";
        }
        else if (isNaN(value)) {
            output = value + " is not a valid number";
        }
    }
    else {
        output = "you do not have permission to do that. Tsk Tsk. Shame.";
    }

    return output;
}

function Signup(name, item) {
    let output = "";
    let itemAssigned = false;

    for (let i = 0; i < _board.length; ++i) {
        if (_board[i]._name === item) {
            _board[i]._assigned.push(name);
            itemAssigned = true;
            break;
        }
    }

    if (itemAssigned) {
        output = "You have signed up for " + item + ".";
    }
    else {
        output = item + " does not exists on the board.";
    }

    return output;
}

function Withdraw(name, item) {
    let output = "";
    let unAssigned = false;
    let itemFound = false;

    for (let i = 0; i < _board.length; ++i) {
        if (_board[i]._name === item) {
            for (let j = 0; j < _board[i]._assigned.length; ++j) {
                if (_board[i]._assigned[j] === name) {
                    _board[i]._assigned.splice(j, 1);
                    unAssigned = true;
                    break;
                }
            }
            itemFound = true;
            break;
        }
    }

    if (unAssigned && itemFound) {
        output = "You have withdrawn from " + item + ".";
    }
    else if (!unAssigned && itemFound) {
        output = "You are not signed up to " + item + ".";
    }
    else if (!unAssigned && !itemFound || !itemFound) {
        output = item + " does not exists on the board.";
    }

    return output;
}

function ShowBoard() {
    let output = "\r\n" + _guildName + "'s Current Board\r\n```";
    let longestNameLength = 11;
    let longestAmountLength = 8;
    let longestAssignedLength = 10;

    for (let i = 0; i < _board.length; ++i) {
        if (_board[i]._name.length > longestNameLength)
            longestNameLength = _board[i]._name.length + 2;

        if (_board[i]._amount.length > longestAmountLength)
            longestAmountLength = _board[i]._amount.length + 2;
    }

    for (let i = 0; i < _board.length; ++i) {
        for (let j = 0; j < _board[i]._assigned.length; ++j) {
            if (_board[i]._assigned[j].length > longestAssignedLength)
                longestAssignedLength = _board[i]._assigned[j].length + 2;
        }
    }

    output += "|";

    for (let i = 0; i < longestNameLength; ++i) output += "‾";

    output += "|";

    for (let i = 0; i < longestAmountLength; ++i) output += "‾";

    output += "|";

    for (let i = 0; i < longestAssignedLength; ++i) output += "‾";

    output += "|\r\n| Item Name ";

    for (let i = 0; i < longestNameLength - 11; ++i) output += " ";

    output += "| Amount ";

    for (let i = 0; i < longestAmountLength - 8; ++i) output += " ";

    output += "| Assigned ";

    for (let i = 0; i < longestAssignedLength - 10; ++i) output += " ";

    output += "|\r\n";

    for (let i = 0; i < _board.length; ++i) {
        output += "|";
        for (let k = 0; k < longestNameLength; ++k) output += "-";
        output += "|";
        for (let k = 0; k < longestAmountLength; ++k) output += "-";
        output += "|";
        for (let k = 0; k < longestAssignedLength; ++k) output += "-";
        output += "|\r\n| ";

        output += _board[i]._name;

        for (let j = 0; j < (longestNameLength - _board[i]._name.length - 1); ++j) output += " ";
        output += "| ";
        output += _board[i]._amount;

        for (let j = 0; j < (longestAmountLength - _board[i]._amount.length - 1); ++j) output += " ";

        output += "|";
        let firstAssigned = false;

        if (_board[i]._assigned.length > 0) {
            for (let j = 0; j < _board[i]._assigned.length; ++j) {
                if (!firstAssigned) {
                    output += " " + _board[i]._assigned[j];
                    for (let k = 0; k < (longestAssignedLength - _board[i]._assigned[j].length - 1); ++k) output += " ";
                    firstAssigned = true;
                }
                else {
                    output += "|";

                    for (let k = 0; k < longestNameLength; ++k) output += " ";

                    output += "|";

                    for (let k = 0; k < longestAmountLength; ++k) output += " ";

                    output += "| ";

                    output += _board[i]._assigned[j];

                    for (let k = 0; k < (longestAssignedLength - _board[i]._assigned[j].length - 1); ++k) output += " ";
                }

                output += "|\r\n";
            }
        }
        else {
            for (let k = 0; k < longestAssignedLength; ++k) output += " ";
            output += "|\r\n";
        }
    }

    output += "|";

    for (let i = 0; i < longestNameLength; ++i) output += "_";

    output += "|";

    for (let i = 0; i < longestAmountLength; ++i) output += "_";

    output += "|";

    for (let i = 0; i < longestAssignedLength; ++i) output += "_";

    output += "|";

    output += "```";

    return output;
}

function Help() {
    return "\r\n**Guild Bank Bot Help**\r\n**!gbb_help** : Shows help\r\n**!gbb_guild** \"name\" : Sets guild name to \"name\"\r\n**!board** : Shows the current board.\r\n**!assign** \"item\" \"name\" : Assigns \"item\" to \"name\".\r\n**!signup** \"item\" : Signs yourself up for \"item\".\r\n**!withdraw** \"item\" : Withdraws yourself from \"item\".\r\n**!unassign** \"item\" \"name\" : Unassigns \"item\" from \"name.\"\r\n**!assigned** \"name\" : Shows items currenty assigned to you.\r\n**!add** \"item\" \"amount\" : Adds \"item\" with amount \"amount\" to the board.\r\n**!remove** \"item\" : Removes \"item\" from the board.\r\n**!amount** \"item\" \"amount\" : Changes amount of \"item\" with \"amount\".";
}