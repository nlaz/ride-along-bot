/**
 * Ride Along Bot
 */

import { TOKEN } from './.config';
import { CronJob } from 'cron';
import { RtmClient, WebClient } from '@slack/client';
import { RTM_EVENTS, CLIENT_EVENTS } from '@slack/client';

const rtm = new RtmClient(TOKEN, {logLevel: 'info'});
const web = new WebClient(TOKEN);

const usage = ":robot_face:*RIDE ALONG * - Your dedicated pairing slackbot";
const CHANNEL = 'C2SJB23T4'; //Hardcoded for hackathon

const createGroups = (members) => {
	members = members.join(',');
	web.mpim.open(members, (err, info) => {
		if (err) throw err;

		rtm.sendMessage('Howdy! Why don\'t you two pick a time to meet this week?', info.group.id);
		rtm.sendMessage('As a reminder, I\'ll pair you with someone in the #engineering_buddies channel every Monday morning.', info.group.id);
		
		setTimeout(() => {
			rtm.sendMessage('That\'s about it for now. Thanks for testing!', info.group.id);
		}, 10000);
	});
};

const shuffleMembers = (members) => {
	for (let i = members.length; i; i--) {
		let j = Math.floor(Math.random() * i);
		[members[i - 1], members[j]] = [members[j], members[i - 1]];
	}
	return members;
};

const pairUsers = (members, botId) => {
	let result = [];
	members = members.filter(mem => mem !== botId);
	members = shuffleMembers(members);
	console.log(members);

	while( members.length > 0 ) {
		let newGroup = [];
		if ( members.length <= 3 ) {
			newGroup = members.slice();
			members = [];
		} else {
			newGroup = [members.pop(), members.pop()];
		}
		newGroup.push(botId);
		result.push(newGroup);
	}
	return result;
};

/* Helper Methods */
const kickOffSessions = (channel) => {
	web.channels.info(channel, (err, info) => {
		if (err) throw err;

		console.log('HERE');
		const pairedGroups = pairUsers(info.channel.members, rtm.activeUserId);
		for(let i in pairedGroups) {
			createGroups(pairedGroups[i]);
		}
	});
};

const job = new CronJob({
	cronTime: '00 30 10 * * 1',
	onTick: () => { kickOffSessions(CHANNEL); },
	start: false,
	timeZone: 'America/New_York'
});

/* Slack RTM Events */
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
	console.log('Connection opened');
	kickOffSessions(CHANNEL);
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

job.start();
rtm.start();
