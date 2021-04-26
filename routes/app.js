const { Router } = require('express');
const router = Router();

// https://swm-chatbot-vjq9yl-cyel2a.run.goorm.io/app


router.get('/', async (req, res, next) => {
	const users = await libKakaoWork.getUserList();
	const conversations = await Promise.all(users.map((user) => libKakaoWork.openConversations({ userId: user.id })));
	
	// get a random url form baekjoon
	const randomUrl = Math.floor(Math.random() * (19000) + 1000);
	const url = "https://www.acmicpc.net/problem/" + randomUrl.toString();
	
	const message = await Promise.all([conversations.map((conversation) => libKakaoWork.sendMessage(
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
	)]);
});

module.exports = router;