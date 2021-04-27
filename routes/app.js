const { Router } = require('express');
const router = Router();
const csv = require('csv-parser');
const fs = require('fs');
const axios = require('axios');

// https://swm-chatbot-vjq9yl-cyel2a.run.goorm.io/app
// aws lambda로 하루 특정시간 / 특정 인터벌로 커밋 알람 보내게 설정

readCSV = function () {
	const results = [];
	fs.createReadStream('user_info.csv')
		.pipe(csv())
		.on('data', (data) => results.push(data))
		.on('end', () => console.log(results));
	console.log(typeof(results));
	return results;
}

checkUserExist = function(results, id) {
	for (var i = 0; i < results.length; i++) {
		if (results[i].id == id) return true;
	}
	return false;
}

getUserCommits = async (id) => {
	const url = "https://github-calendar.herokuapp.com/commits/last/" + id;
	var data;
	var commits = 0;
	commits = await axios
		.get(url)
		.then((Response) => {
			data = Response.data.data;
			for (var i = 0; i < data.length; i++) commits += parseInt(data[i]);
			return commits;
		});
	return commits
}


router.get('/', async (req, res, next) => {
	const users = await libKakaoWork.getUserList();
	const conversations = await Promise.all(users.map((user) => libKakaoWork.openConversations({ userId: user.id })));
	console.log('hello');
	
	// get a random url form baekjoon
	const randomUrl = Math.floor(Math.random() * (19000) + 1000);
	const url = "https://www.acmicpc.net/problem/" + randomUrl.toString();
	
	const message = await Promise.all([conversations.map((conversation) => {
		
		libKakaoWork.sendMessage(
			{
				conversationId: conversation.id,
				text: "1일 1커밋 알림",
				blocks: [
					{
						"type": "header",
						"text": "1일 1커밋",
						"style": "blue"
					},
					{
						"type": "text",
						"text": "1일 1커밋을 하세요",
						"markdown": true
					},
					{
						"type": "button",
						"text": "문제 풀러가기",
						"style": "default",
						"action_type": "open_system_browser",
						"value": url
					}
				]
			}
		)
	}
	)]);
});

module.exports = {
	router,
	readCSV,
	checkUserExist,
	getUserCommits
};