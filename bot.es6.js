/**
 * Ride Along Bot
 */

import { TOKEN } from './.config';
import { CronJob } from 'cron';
import { RtmClient, WebClient } from '@slack/client';
import { RTM_EVENTS, CLIENT_EVENTS } from '@slack/client';


const rtm = new RtmClient(TOKEN, {logLevel: 'info'});

const usage = ":robot_face:*RIDE ALONG * - Your dedicated pairing slackbot";

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
	console.log('Connection opened');
});

rtm.on(CLIENT_EVENTS.RTM.DISCONNECT, () => {
	console.log('Connection closed');
});

rtm.on(RTM_EVENTS.MESSAGE, (data) => {
	console.log(data);
	let command = data.text;
	const botId = `<@${rtm.activeUserId}>`;

	if( command.substring(0, botId.length) === botId) {
		command = command.substring(botId.length + 1).trim();
	}

	switch (command) {
		case 'help':
			rtm.sendMessage(usage, data.channel);
			break;
	}

});

const pairUsers = () => {
	// TODO Grab users from channel
	// create chats b/t them
};

const job = new CronJob({
	cronTime: '00 30 10 * * 1',
	onTick: pairUsers,
	start: false,
	timeZone: 'America/New_York'
});


rtm.start();
