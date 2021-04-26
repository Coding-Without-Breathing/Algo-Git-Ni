// libs/kakaoWork/index.js
const Config = require('config');

const axios = require('axios');
const kakaoInstance = axios.create({
  baseURL: 'https://api.kakaowork.com',
  headers: {
    Authorization: `Bearer ${Config.keys.kakaoWork.bot}`,
  },
});

// 유저 목록 검색 (1)
exports.getUserList = async () => {
  const res = await kakaoInstance.get('/v1/users.list');
  return res.data.users;
};

//유저 한명 정보 가져오기
exports.getUserInfo = async({userId}) => {
	let getUserInfourl = 'v1/users.info?user_id=' + String(userId) + '';
	//console.log(getUserInfourl);
	const res = await kakaoInstance.get(getUserInfourl);
	//console.log(res.data);
	return res.data.user;
}

// 채팅방 생성 (2)
exports.openConversations = async ({ userId }) => {
  const data = {
    user_id: userId,
  };
  const res = await kakaoInstance.post('/v1/conversations.open', data);
  return res.data.conversation;
};

// 메시지 전송 (3)
exports.sendMessage = async ({ conversationId, text, blocks }) => {
  const data = {
    conversation_id: conversationId,
    text,
    ...blocks && { blocks },
  };
  const res = await kakaoInstance.post('/v1/messages.send', data);
  return res.data.message;
};
	
	
// 카카오 워크 스페이스 정보 확인
exports.checkWorkSpace = async () => {
  const res = await kakaoInstance.get('/v1/spaces.info');
  return res.data.space;
	
	//주석된 코드는 routes/index.js에서 space 출력하는 방법입니다.
	//checkWorkSpace() 함수의 결과값 확인 가능
	//const space = await libKakaoWork.checkWorkSpace();
	//console.log(space);
};
	
// 카카오 워크 부서 정보 확인
exports.checkDepartments = async () => {
  const res = await kakaoInstance.get('/v1/departments.list');
  return res.data.departments;
};