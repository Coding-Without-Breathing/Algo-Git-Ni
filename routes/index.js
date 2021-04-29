const express = require('express');
const router = express.Router();
const app = require('./commit');
const { User, Problem } = require('../model/schema.js');
const libKakaoWork = require('../libs/kakaoWork');

const axios = require('axios');
const fs = require('fs');

// user_info.csv - 백업용, user_info_data - 실제 사용
let user_info_data = new Array();

// Badge 이미지 파일 모음
const bronze_badge =
	'https://w.namu.la/s/11942d0ba53861ba149c2bce0c0f1410d9b20b27df1aa9f57ffc581a9803135b8a40550d538265aabf27e9c9af7c7551137bf916ee48e7b46e24ff12715a4c9f7babd95282696ce241966bf0b6504666c36eb9f2b3c986e941b781a18e7d50e9';
const silver_badge =
	'https://ww.namu.la/s/12972d264f271356f0628c24e6a7a3c51a7899873758ce82539541afc4ab5cf253371d5cae03104d1c8d9c6144bf19a2319f6d655cba4a37bf070bec1273255144acfb895ccd47efed4d3451eb894fd306f625d8ac9397a9951ccc4f68908f8d';
const gold_badge =
	'https://ww.namu.la/s/52ec96c36593cb9a5207c62eae6643e5c61feddd26f0d839448289c9ecd639d90c2bc52ca84a49a728d36bee6d49b2527ec1edacdf394aff7f0e9e4d97a9e98ffa618d056efe358e13e1cb36a4664fc8c6c97204ab56008168dd00d4dd1d1653';
const platinum_badge =
	'https://ww.namu.la/s/745ebb10157397861954049ef4c0b9f8ae47a0ca4ad4333f7b198e02f9712f63789756f32792483823e132c9e49b86cc4ece11e8610e342329c206f751e08cb2e2278111310dfe3e073b275619ee9fd948a0e5b4f088f44ea21956aaf9b6f510';
const diamond_badge =
	'https://w.namu.la/s/51e9b4029ac1a490c24ea1718b11c895963a3c1b4d03e9d5938b083237f37eaeb52cf84bc5c57630cb71e41ae864b415728fcc9bd37530a87c750c3b565b15655fedaabcbe16404c4c31cd4472c90abadfc439b89c59eb44f33f8b88711fd702';
const master_badge =
	'https://ww.namu.la/s/6d6b0d933d903405b9d1a2ffd661d8a209390976706aa7134eb9375183fe3ca9884d1b89d211168ad53f9da429027f8f9114a66167984a2c9d903ccb13a161c6aef86c3a1304a16629599d554781a3640511164007ca97e545a02e2d12c639af';
const grand_master_badge =
	'https://w.namu.la/s/d2fdea36f0d9063c361b1e731dca53f3bdb2da255a53b1269c27e575360a61620132fec2c1a885d725006e307b1f184a54c5b5b444b127c3b9ad9f39d8b510c423e7fcde1a7e4267a7f71d1012d89e54a1dba31bb3e2af9a9f5fd838e30d6723';
const challenger_badge =
	'https://w.namu.la/s/898f819011a834679616105fac44b4b86fa9253620d53695d789b60391515cddd42023f1f6df4391481c0eab7dc4024ea54c7dcd8a4e5d3c9134b81c2e0a6f7d575e24b8fff5ceeaa506d1aa89710619c36e5c02f9b29aefac4dfe86c6c952cf';

const study_menu_message = [
	{
		type: 'header',
		text: '알고있니 (Algo-Git-니)',
		style: 'blue',
	},
	{
		type: 'image_link',
		url:
			'https://www.pewresearch.org/internet/wp-content/uploads/sites/9/2017/02/PI_2017.02.08_Algorithms_featured.png',
	},
	{
		type: 'text',
		text: '*📝 PS (알고리즘) 스터디 진행*',
		markdown: true,
	},
	{
		type: 'text',
		text: '원하시는 메뉴를 선택해주세요!\n',
		markdown: true,
	},
	{
		type: 'button',
		text: '획득한 뱃지 보기',
		action_type: 'submit_action',
		action_name: 'show_badge',
		value: 'show_badge',
		style: 'primary',
	},
	{
		type: 'button',
		text: '추천 문제 받기',
		action_type: 'submit_action',
		action_name: 'show_recommend_problem',
		value: 'show_recommend_problem',
		style: 'primary',
	},
	{
		action_type: 'submit_action',
		action_name: 'help',
		type: 'button',
		value: 'help',
		text: '도움말 보기',
		style: 'default',
	},
];

// ranking: 랭킹을 반환하는 함수
// parameter: cnt - user의 커밋 횟수 배열
// return: user의 랭킹 배열
function ranking(cnt) {
	var n = cnt.length;
	rank = [];

	for (var i = 0; i < n; i++) rank[i] = 1;

	for (var i = 0; i < n; i++) {
		for (var j = 0; j < n; j++) {
			if (cnt[i] < cnt[j]) rank[i]++;
		}
	}

	return rank;
}

function eval(u_rank, u_rate) {
	var p = (u_rank * 100) / user_info_data.length;

	// 사람이 매우 적을때 - 달성률만 가지고 판단한다
	if (user_info_data.length <= 3) {
		if (u_rate >= 80) return 'ヾ(≧▽≦*)o\n성실하게 참여하고 있군요!!\n앞으로도 이대로만 합시다!';
		if (u_rate >= 50)
			return "( •̀'ω •́')✧\n열심히 참여하고 있군요!!\n조금만 더 열심히 해볼까요??";
		if (u_rate >= 20)
			return 'ผ(•̀_•́ผ)\n순위는 높지만 달성률은 다소 낮네요... \n그래도 포기하지 않는다면 좋은 결과 있을거예요!!';
		return '(´。＿。｀)이번달에 많이 바쁘셨나봐요..ㅠㅠ\n남은 요일 열심히 커밋해보아요!';
	}

	if (p <= 25 && u_rate >= 60) {
		if (u_rate >= 80) return 'ヾ(≧▽≦*)o\n성실하게 참여하고 있군요!\n앞으로도 이대로만 합시다!';
		return "( •̀'ω •́')✧\n열심히 참여하고 있군요!\n조금만 더 열심히 해볼까요?";
	} else if (p <= 25) {
		if (u_rate >= 20) return 'ผ(•̀_•́ผ)\n포기하지 않는다면 좋은 결과 있을거예요! 파이팅!!';
		return '이번달에 많이 바쁘셨나봐요..ㅠㅠ\n남은 요일 열심히 해보아요!';
	} else if (p >= 50 && u_rate >= 60)
		return "( •̀'ω •́')✧\n 지금까지 열심히 하고 있습니다! 조금만 더 열심히 해볼까요?";
	else if (u_rate >= 20)
		return 'ผ(•̀_•́ผ)\n아직까지는 괜찮아요! 포기하지 않는다면 좋은 결과 있을거예요!';
	else return '(´。＿。｀)이번달에 많이 바쁘셨나봐요..ㅠㅠ\n남은 요일 열심히 해보아요!';
}

// arch_rate: 달성률 반환 함수
// parameter: count - 현재까지의 커밋 횟수 합
// return: 달성률(integer)
function achi_rate(count) {
	var now = new Date();
	var date = now.getDate();

	// 소수점 버리고 반환
	return Math.floor((count * 100) / date);
}

// check_rank: 자신의 랭킹을 반환하는 함수
// parameter: obj - csv 객체, user - user id
// return: 자신의 랭킹(integer)
function check_rank(user) {
	var obj = user_info_data;
	var commit_cnt = [];
	var idx = -1;

	for (var i = 0; i < obj.length; i++) {
		if (obj[i].git_id == user) idx = i;
		commit_cnt[i] = obj[i].today_count;
	}

	var rank = ranking(commit_cnt);

	return rank[idx];
}

// 이 방식을 사용하려면 dictionary같은거를 써서/
// git 닉네임에 인덱스를 부여해야 할 것 같아요

// parameter: Git Nickname
// Commit Data Crawling
// commitlist에 이번달 Commit 데이터가 배열로 들어가있음, 27일이면 0~26까지 존재
const getHtml = async (git_name) => {
	try {
		return await axios.get('https://github-calendar.herokuapp.com/commits/' + git_name);
	} catch (error) {
		console.error(error);
	}
};

/*
 * For test, debug
router.get('/', async(req,res,next) => {
	res.redirect(url.format({
	pathname:"/chatbot",
	query:{
		"test":1
	}
	}))
});
*/
router.post('/chatbot', async (req, res, next) => {
	// router.get('/', async (req, res, next) => {
	/*
	 * 워크 스페이스에 있는 19팀을 찾아보았습니다.
	 * 워크스페이스 내 나뉘어진 부서들의 정보를 확인
	 * 연수생들은 4번째 idx안에 있는 것으로 판단됨.
	 * 근데 176명에 대해서 api를 호출하니 너무 느려서 중간에 끊깁니다ㅠ
	 */
	const departments = await libKakaoWork.checkDepartments();

	//var userArr = departments[4].users_ids;
	var userArr = [];
	var step, cnt;
	//console.log('총 연수생 : '+arrsize);
	for (step = 0; step < 5; step++) {
		for (cnt = 0; cnt < departments[step].users_ids.length; cnt++) {
			userArr.push(departments[step].users_ids[cnt]);
		}
	}

	//userArr를 사용하면 될 것 같아요 이제
	/*
	for (step = 0; step<arrsize-1 ; step++){
		const a_user = await libKakaoWork.getUserInfo({userId:userArr[step]});
		
		//team19 id 저장
		if(a_user.name=='가동식' || a_user.name=='김현준' || a_user.name =='김형민' || a_user.name == '이주형' || a_user.name == '황수민' || a_user.name == '이현민'){
			team19_users.push(a_user.id);
		}		
	}
	*/

	/**
		//가동식 : 2611564
		//김현준 : 2612127
		//김형민 : 2612207
		//이주형 : 2615809
		//황수민 : 2610786
		//이현민 : 2610805
	**/

	// 유저 목록 검색 (1)
	let users = await libKakaoWork.getUserList();
	let team19_users = [/*2611564, */2612127, /*2612207, 2615809,*/ 2610786, /*2610805*/];

	//누가 이 workspace 내에 있나 확인
	//users.map((user) => {console.log(user.id + user.name);});

	// call data from .csv file on server start

	console.log(userArr);

	user_info_data = app.readCSV();

	// 검색된 모든 유저에게 각각 채팅방 생성 (2)
	let conversations = await Promise.all(
		//users.map((user) => libKakaoWork.openConversations({userId:user.id}))
		team19_users.map((userid) => libKakaoWork.openConversations({ userId: userid }))
		// userArr.map((userid) => libKakaoWork.openConversations({ userId: userid }))
	);
	
	// 생성된 채팅방에 메세지 전송 (3)
	const messages = await Promise.all([
		await conversations.map((conversation) => {
			var isData = false;
			user_info_data.map((user_info) => {
				if (user_info.conversation_id == conversation.id) isData = true;
			});

			if (isData) {
				// commit 기능에서 이미 데이터에 등록되어있는 경우
				libKakaoWork.sendMessage({
					conversationId: conversation.id,
					text: '커밋 챌린지 | PS 스터디 개설 안내',
					blocks: [
						{
							type: 'header',
							text: '알고있니 (Algo-Git-니)',
							style: 'blue',
						},
						{
							type: 'image_link',
							url:
								'https://www.pewresearch.org/internet/wp-content/uploads/sites/9/2017/02/PI_2017.02.08_Algorithms_featured.png',
						},
						{
							type: 'text',
							text: '📝  *알고있니? 이런 기능.*',
							markdown: true,
						},
						{
							type: 'text',
							text:
								'알고있니 봇은 Git 커밋 챌린지 개설 기능, 알고리즘 문제풀이 (PS) 스터디 개설 기능을 지원합니다!\n\n 원하시는 기능을 선택해주세요!',
							markdown: true,
						},
						{
							type: 'button',
							action_type: 'submit_action',
							action_name: 'show_commit_challenge',
							value: 'show_commit_challenge',
							text: '커밋 챌린지 메뉴보기',
							style: 'primary',
						},
						{
							type: 'button',
							action_type: 'call_modal',
							value: 'create_ps_study',
							text: 'PS 스터디 개설하기',
							style: 'primary',
						},
						{
							type: 'button',
							action_type: 'submit_action',
							action_name: 'help',
							value: 'help',
							text: '도움말 보기',
							style: 'default',
						},
					],
				});
			} else {
				// 등록 되어있지않은 경우
				libKakaoWork.sendMessage({
					conversationId: conversation.id,
					text: '커밋 챌린지 | PS 스터디 개설 안내',
					blocks: [
						{
							type: 'header',
							text: '알고있니 (Algo-Git-니)',
							style: 'blue',
						},
						{
							type: 'image_link',
							url:
								'https://www.pewresearch.org/internet/wp-content/uploads/sites/9/2017/02/PI_2017.02.08_Algorithms_featured.png',
						},
						{
							type: 'text',
							text: '📝  *알고있니? 이런 기능.*',
							markdown: true,
						},
						{
							type: 'text',
							text:
								'알고있니 봇은 Git 커밋 챌린지 개설 기능, 알고리즘 문제풀이 (PS) 스터디 개설 기능을 지원합니다!\n\n 원하시는 기능을 선택해주세요!',
							markdown: true,
						},
						{
							type: 'button',
							action_type: 'call_modal',
							value: 'create_commit_challenge',
							text: '커밋 챌린지 참가하기',
							style: 'primary',
						},
						{
							type: 'button',
							action_type: 'call_modal',
							value: 'create_ps_study',
							text: 'PS 스터디 개설하기',
							style: 'primary',
						},
						{
							type: 'button',
							action_type: 'submit_action',
							action_name: 'help',
							value: 'help',
							text: '도움말 보기',
							style: 'default',
						},
					],
				});
			}
		}),
	]);

	res.json({ team19_users, conversations, messages });
});

// 등록된 웹훅 통해서 푸시 이벤트 발생했을 때 진입
router.post('/webhook-push', async (req, res, next) => {
	const { message, value } = req.body;

	//문제번호로 commit한 거에 대해서 제어
	//해당 문제를 푼 사람에 그 사람의 이름 넣기
	let username = req.body.pusher.name;
	let aproblem = req.body.head_commit.message;

	const user = await User.findOne({ github_id: username });
	const problem_flag = user.problem.find((element) => element == aproblem);
	const problemarray = user.problem;
	if (problem_flag === undefined) {
		await problemarray.push(aproblem);
		await user.save();
	}
	//await User.findOneAndUpdate({github_id : username}, {problem : problemarray});

	//해당 문제가 DB에 있는지 찾기
	let nProblem = await Problem.findOne({ problem: aproblem });

	if (nProblem == null) {
		var inputdata = new Problem({ problem: aproblem, user: [username] });
		inputdata.save();
	} else {
		userarray = nProblem.user;
		let dup_check = userarray.find((element) => element == username);
		if (dup_check == null) userarray.push(username);
		await Problem.update({ problem: aproblem }, { user: userarray });
	}

	res.json({ result: 'success' });
});

router.post('/request', async (req, res, next) => {
	const { message, value } = req.body;
	switch (value) {
		case 'create_commit_challenge':
			return res.json({
				view: {
					title: 'Commit Challenge 참가하기',
					accept: '정보 전송하기',
					decline: '취소',
					value: 'create_commit_challenge_results',
					blocks: [
						{
							type: 'label',
							text: '*🖐🏻  챌린지 참가 정보*',
							markdown: true,
						},
						{
							type: 'label',
							text:
								'반갑습니다!🎉🎉 Algo-Git-니 커밋 챌린지 기능은 참가자의 일일 커밋을 독려하여 잔디밭을 만들도록 돕는 기능입니다! 지금 바로 참가하여 풍성한 잔디밭을 만들어보아요!!🔥🔥 \n\n',
							markdown: true,
						},
						{
							type: 'label',
							text: '본인의 *GitHub ID*를 입력해주세요!',
							markdown: true,
						},
						{
							type: 'input',
							name: 'git_name',
							required: true,
							placeholder: 'ex) Algogitni',
						},
						{
							type: 'label',
							text:
								'"정보 전송하기" 버튼을 누르면 사용자의 개인 Git commit 데이터 사용에 동의하는것으로 간주합니다.\n또한 private Git Repository에서의 Commit은 확인할 수 없으니 유의해주시기 바랍니다!',
							markdown: true,
						},
					],
				},
			});
			break;

		case 'create_ps_study':
			// PS 스터디 개설 모달 전송
			return res.json({
				view: {
					title: 'PS 알고리즘 스터디 개설하기',
					accept: '정보 전송하기',
					decline: '취소',
					value: 'create_ps_study_results',
					blocks: [
						{
							type: 'label',
							text: '*⚠️  필수 세팅*',
							markdown: true,
						},
						{
							type: 'label',
							text:
								'스터디를 진행할 *GitHub Repo* 에 *WebHook* 설정이 필요합니다. 자세한 사항은 Repo 등록 후 안내해드리겠습니다!\n\n',
							markdown: true,
						},
						{
							type: 'label',
							text: '*💻  GitHub Repo 정보*',
							markdown: true,
						},
						{
							type: 'label',
							text: '스터디를 진행할 *GitHub Repo* 의\n*URL*을 입력해주세요!',
							markdown: true,
						},
						{
							type: 'input',
							name: 'repo_url',
							required: true,
							placeholder: 'ex) https://github.com/ps-stydy/Algo-Git-Ni',
						},
						{
							type: 'label',
							text: '*🖐🏻  GitHub ID 정보*',
							markdown: true,
						},
						{
							type: 'label',
							text: '본인의 *GitHub ID*를 입력해주세요!',
							markdown: true,
						},
						{
							type: 'input',
							name: 'github_id',
							required: true,
							placeholder: 'ex) H43RO',
						},
					],
				},
			});
			break;
		default:
			console.log('Request Error');
	}

	res.json({});
});

router.post('/callback', async (req, res, next) => {
	const { message, actions, action_time, value, react_user_id } = req.body;
	switch (value) {
		case 'show_main_menu':
			libKakaoWork.sendMessage({
				conversationId: message.conversation_id,
				text: '알고있니 (Algo-Git-니)',
				blocks: [
					{
						type: 'header',
						text: '알고있니 (Algo-Git-니)',
						style: 'blue',
					},
					{
						type: 'image_link',
						url:
							'https://www.pewresearch.org/internet/wp-content/uploads/sites/9/2017/02/PI_2017.02.08_Algorithms_featured.png',
					},
					{
						type: 'text',
						text: '📝  *알고있니? 이런 기능.*',
						markdown: true,
					},
					{
						type: 'text',
						text:
							'알고있니 봇은 Git 커밋 챌린지 개설 기능, 알고리즘 문제풀이 (PS) 스터디 개설 기능을 지원합니다!\n\n 원하시는 기능을 선택해주세요!',
						markdown: true,
					},
					{
						type: 'button',
						action_type: 'submit_action',
						action_name: 'show_commit_challenge',
						value: 'show_commit_challenge',
						text: '커밋 챌린지 참가하기',
						style: 'primary',
					},
					{
						type: 'button',
						action_type: 'call_modal',
						value: 'create_ps_study',
						text: 'PS 스터디 개설하기',
						style: 'primary',
					},
					{
						type: 'button',
						action_type: 'submit_action',
						action_name: 'help',
						value: 'help',
						text: '도움말 보기',
						style: 'default',
					},
				],
			});
			break;

		case 'show_commit_challenge':
			var idx = -1;
			for (var i = 0; i < user_info_data.length; i++) {
				if (user_info_data[i].conversation_id == message.conversation_id) {
					idx = i;
					break;
				}
			}
			
			console.log(user_info_data[idx].git_id);

			await libKakaoWork.sendMessage({
				conversationId: message.conversation_id,
				text: '알고있니 (Algo-Git-니)',
				blocks: [
					{
						type: 'header',
						text: '내 정보 확인',
						style: 'blue',
					},
					{
						type: 'image_link',
						url:
							'https://cdn.pixabay.com/photo/2017/08/05/11/24/logo-2582757_960_720.png',
					},
					{
						type: 'text',
						text: `*${user_info_data[idx].git_id}*님은 현재 *커밋 챌린지*에\n참가하고 있습니다.\n\n오늘의 커밋 여부, 전체 사용자 중 순위와 달성률 정보를 확인할 수 있습니다.\n\n(순위는 자정마다 갱신됩니다)`,
						markdown: true,
					},
					{
						type: 'button',
						text: '오늘 커밋 여부 확인',
						action_type: 'submit_action',
						action_name: 'today_commit',
						value: 'today_commit',
						style: 'primary',
					},
					{
						type: 'button',
						text: '나의 순위 보기',
						style: 'default',
						action_type: 'submit_action',
						action_name: 'user_rank',
						style: 'primary',
						value: 'user_rank',
					},
					{
						type: 'button',
						text: '달성률 확인',
						action_type: 'submit_action',
						action_name: 'rate',
						style: 'primary',
						value: 'rate',
					},
					{
						action_type: 'submit_action',
						action_name: 'show_main_menu',
						type: 'button',
						value: 'show_main_menu',
						text: '처음으로',
						style: 'default',
					},
					{
						type: 'button',
						action_type: 'submit_action',
						action_name: 'help',
						value: 'help',
						text: '도움말 보기',
						style: 'default',
					},
				],
			});
			break;
		case 'today_commit':
			var idx = -1;
			for (var i = 0; i < user_info_data.length; i++) {
				if (user_info_data[i].conversation_id == message.conversation_id) {
					idx = i;
					break;
				}
			}
			var commit_cnt = 0;
			getHtml(user_info_data[idx].git_id)
				.then((crawlData) => {
					var commitstring = JSON.stringify(crawlData.data);
					var commitlist = commitstring.substring(9, commitstring.length - 2).split(',');
					return commitlist[commitlist.length - 1];
				})
				.then((res) => {
					commit_cnt = res;
					libKakaoWork.sendMessage({
						conversationId: message.conversation_id,
						text: '알고있니 (Algo-Git-니)',
						blocks: [
							{
								type: 'header',
								text: '오늘의 커밋',
								style: 'blue',
							},
							{
								type: 'image_link',
								url:
									'https://cdn.pixabay.com/photo/2017/08/05/11/24/logo-2582757_960_720.png',
							},
							{
								type: 'text',
								text: `오늘 *${user_info_data[idx].git_id}*님은\n*${commit_cnt}번* 커밋 했습니다! 😃`,
								markdown: true,
							},
							{
								type: 'button',
								action_type: 'submit_action',
								action_name: 'show_commit_challenge',
								value: 'show_commit_challenge',
								text: '커밋 챌린지 메뉴',
								style: 'default',
							},
						],
					});
				});

			break;

		case 'rate':
			var idx = -1;
			for (var i = 0; i < user_info_data.length; i++) {
				if (user_info_data[i].conversation_id == message.conversation_id) {
					idx = i;
					break;
				}
			}
			//function eval(u_rank, u_rate)

			var comment = eval(
				user_info_data[idx].today_rank,
				achi_rate(user_info_data[idx].today_count)
			);

			// 달성률 선택
			libKakaoWork.sendMessage({
				conversationId: message.conversation_id,
				text: '알고있니 (Algo-Git-니)',
				blocks: [
					{
						type: 'header',
						text: '커밋 목표 달성률 알림',
						style: 'blue',
					},
					{
						type: 'image_link',
						url: 'https://cdn.pixabay.com/photo/2016/08/23/17/30/cup-1615074_1280.png',
					},
					{
						type: 'text',
						text:
							`*${user_info_data[idx].git_id}*님의 달성률은\n${achi_rate(
								user_info_data[idx].today_count
							)}%입니다.\n\n` + comment + '\n\n*달성률은 (금월 커밋을 한 날짜 개수 / 금월 총 날짜 개수) 입니다.',
						markdown: true,
					},
					{
						type: 'button',
						action_type: 'submit_action',
						action_name: 'show_commit_challenge',
						value: 'show_commit_challenge',
						text: '커밋 챌린지 메뉴',
						style: 'default',
					},
				],
			});
			break;

		case 'user_rank':
			var idx = -1;
			for (var i = 0; i < user_info_data.length; i++) {
				if (user_info_data[i].conversation_id == message.conversation_id) {
					idx = i;
					break;
				}
			}

			var comment = eval(
				user_info_data[idx].today_rank,
				achi_rate(user_info_data[idx].today_count)
			);

			libKakaoWork.sendMessage({
				conversationId: message.conversation_id,
				text: '알고있니 (Algo-Git-니)',
				blocks: [
					{
						type: 'header',
						text: '순위 알림',
						style: 'blue',
					},
					{
						type: 'image_link',
						url: 'https://cdn.pixabay.com/photo/2016/08/23/17/30/cup-1615074_1280.png',
					},
					{
						type: 'text',
						text:
							`*${user_info_data[idx].git_id}*님의 순위는\n${user_info_data.length}명 중 *${user_info_data[idx].today_rank}등* 입니다.\n\n` +
							comment,
						markdown: true,
					},
					{
						type: 'button',
						action_type: 'submit_action',
						action_name: 'show_commit_challenge',
						value: 'show_commit_challenge',
						text: '커밋 챌린지 메뉴',
						style: 'default',
					},
				],
			});

			break;

		case 'create_commit_challenge_results':
			const github_url = 'https://github.com/' + actions.git_name;
			console.log(github_url);
			axios
				.get(github_url)
				.then((Response) => {
					// commit_Crawling(actions.git_name);
					console.log(Response.status);
					if (Response.status == 200) {
						// 유저 이름이 올바른 경우
						if (app.checkUserExist(user_info_data, actions.git_name)) {
							// 유저가 이미 챌린지에 포함되어 있음
							console.log('userexists');
							libKakaoWork.sendMessage({
								conversationId: message.conversation_id,
								text: '알고있니 (Algo-Git-니)',
								blocks: [
									{
										type: 'header',
										text: '커밋 챌린지 참가 오류 안내',
										style: 'blue',
									},
									{
										type: 'text',
										text: `${actions.git_name}은 커밋 챌린지에 이미 참가되어 있습니다.\n`,
										markdown: true,
									},
									{
										type: 'button',
										action_type: 'submit_action',
										action_name: 'show_commit_challenge',
										value: 'show_commit_challenge',
										text: '커밋 챌린지 메뉴',
										style: 'primary',
									},
								],
							});
						} else if (
							app.checkConversationExist(user_info_data, message.conversation_id)
						) {
							console.log('conversation');
							libKakaoWork.sendMessage({
								conversationId: message.conversation_id,
								text: '알고있니 (Algo-Git-니)',
								blocks: [
									{
										type: 'header',
										text: '커밋 챌린지 참가 오류 안내',
										style: 'blue',
									},
									{
										type: 'text',
										text:
											'한 GitHub 계정에 한 번만 커밋 챌린지에 참여할 수 있습니다.',
										markdown: true,
									},
									{
										type: 'button',
										action_type: 'submit_action',
										action_name: 'show_commit_challenge',
										value: 'show_commit_challenge',
										text: '커밋 챌린지 메뉴',
										style: 'primary',
									},
								],
							});
						} else {
							// 유저가 챌린지에 포함되어있지 않음
							// commit_info_add(message.conversation_id, actions.git_name);
							// commit_cnt.push({ id: actions.git_name, count: commits });
							
								app.initialUserInput(
									user_info_data,
									message.conversation_id,
									actions.git_name
								)
								.then((returnValue) => {
									user_info_data = returnValue;
									// rank();//
									libKakaoWork.sendMessage({
										conversationId: message.conversation_id,
										text: '알고있니 (Algo-Git-니)',
										blocks: [
											{
												type: 'header',
												text: '커밋 챌린지 참여 안내',
												style: 'blue',
											},
											{
												type: 'text',
												text:
													'*커밋 챌린지 신청*이 완료되었습니다!\n매일 10시에 당일 커밋 여부에 따라, 관련 알람을 받아보실 수 있습니다.',
												markdown: true,
											},
											{
												type: 'button',
												action_type: 'submit_action',
												action_name: 'show_commit_challenge',
												value: 'show_commit_challenge',
												text: '커밋 챌린지 메뉴',
												style: 'primary',
											},
										],
									});

									return returnValue;
								});
						}
					}
				})
				.catch((Error) => {
					console.log('error?');
					libKakaoWork.sendMessage({
						conversationId: message.conversation_id,
						text: '알고있니 (Algo-Git-니)',
						blocks: [
							{
								type: 'header',
								text: '커밋 챌린지 참여 안내',
							},
							{
								type: 'text',
								text: '에러가 발생하였습니다.\n다시 시도해 주세요',
							},
						],
					});
				});
			break;
		case 'create_ps_study_results':
			// Public Repo 만 200 OK 됨! (참고)
			axios
				.get(actions.repo_url)
				.then((Response) => {
					console.log(Response.status);
					// 만약 유효한 레포를 입력받았을 경우 (성공)

					if (Response.status == 200) {
						// GitHub ID, Repo URL insert
						console.log(react_user_id);
						var user = new User({
							github_id: actions.github_id,
							kakaowork_id: react_user_id,
							repo_url: actions.repo_url,
						});

						user.save();

						console.log('user');
						console.log(user);

						libKakaoWork.sendMessage({
							conversationId: message.conversation_id,
							text: '등록 성공!',
							blocks: [
								{
									type: 'text',
									text: '*GitHub Repo 확인!*',
									markdown: true,
								},
								{
									type: 'text',
									text: `${actions.github_id}님, 성공적으로 Repo 가 확인되었습니다. 해당 Repo 로 스터디를 진행하시겠습니까?`,
									markdown: true,
								},
								{
									type: 'context',
									content: {
										type: 'text',
										text: `[등록된 스터디 Repo 확인하기](${actions.repo_url})`,
										markdown: true,
									},
									image: {
										type: 'image_link',
										url:
											'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
									},
								},
								{
									type: 'button',
									action_type: 'submit_action',
									action_name: 'confirm_study_repo',
									value: 'confirm_study_repo',
									text: '진행하기',
									style: 'default',
								},
							],
						});
					} else {
						libKakaoWork.sendMessage({
							conversationId: message.conversation_id,
							text: '알고있니 (Algo-Git-니)',
							blocks: [
								{
									type: 'text',
									text: '*잘못된 GitHub Repo 입니다.*',
									markdown: true,
								},
								{
									type: 'text',
									text:
										'URL이 잘못되었거나 존재하지 않는 Repo 입니다. 확인 후 다시 입력해주세요!',
									markdown: true,
								},
								{
									type: 'button',
									text: '다시 입력하기',
									action_type: 'call_modal',
									value: 'create_ps_study',
									style: 'primary',
								},
								{
									type: 'button',
									text: 'Repo 생성하기',
									action_type: 'open_system_browser',
									value: 'https://github.com/new',
								},
							],
						});
					}
				})
				.catch((Error) => {
					// console.log(Error);
				});

			break;

		case 'confirm_study_repo':
			libKakaoWork.sendMessage({
				conversationId: message.conversation_id,
				text: '알고있니 (Algo-Git-니)',
				blocks: [
					{
						type: 'image_link',
						url:
							'https://images.velog.io/images/jaeeunxo1/post/b809e9c6-b5af-4cce-a13f-c9a745b4f4bb/768px-Ei-sc-github.svg.png',
					},
					{
						type: 'text',
						text: '*WebHook 설정하기*',
						markdown: true,
					},
					{
						type: 'text',
						text:
							'원활한 스터디 진행을 위해서는 GitHub Repo 에 WebHook 을 필수적으로 세팅해줘야 합니다. 아래 문서를 참고하여, 설정을 완료해주세요! (이미 적용되어있으면 상관없습니다)\n',
						markdown: true,
					},
					{
						type: 'context',
						content: {
							type: 'text',
							text:
								'[GitHub WebHook 설정 방법](https://www.notion.so/haero/GitHub-WebHook-48a29c9e0395497eb60d59fa48587d13)',
							markdown: true,
						},
						image: {
							type: 'image_link',
							url:
								'https://t1.kakaocdn.net/kakaowork/resources/block-kit/context/pdf@3x.png',
						},
					},
					{
						type: 'divider',
					},
					{
						type: 'text',
						text: '이후 *설정 완료* 버튼을 눌러주세요!',
						markdown: true,
					},
					{
						action_type: 'submit_action',
						action_name: 'complete_setting',
						value: 'complete_setting',
						type: 'button',
						text: '설정 완료',
						style: 'default',
					},
				],
			});
			break;

		case 'complete_setting':
			libKakaoWork.sendMessage({
				conversationId: message.conversation_id,
				text: '알고있니 (Algo-Git-니)',
				blocks: [
					{
						type: 'header',
						text: '알고있니 (Algo-Git-니)',
						style: 'blue',
					},
					{
						type: 'image_link',
						url:
							'https://www.pewresearch.org/internet/wp-content/uploads/sites/9/2017/02/PI_2017.02.08_Algorithms_featured.png',
					},
					{
						type: 'text',
						text:
							'*📝 PS (알고리즘) 스터디 진행 안내*\n\n만약 문제를 해결했다면, 커밋 메세지에는 *백준 온라인 문제 번호만* 적어주세요! 알고있니 봇은 커밋 메세지의 문제 번호를 기반으로 데이터를 입력합니다.',
						markdown: true,
					},
					{
						type: 'text',
						text: '원하시는 메뉴를 선택해주세요!\n',
						markdown: true,
					},
					{
						type: 'button',
						text: '획득한 뱃지 보기',
						action_type: 'submit_action',
						action_name: 'show_badge',
						value: 'show_badge',
						style: 'primary',
					},
					{
						type: 'button',
						text: '추천 문제 받기',
						action_type: 'submit_action',
						action_name: 'show_recommend_problem',
						value: 'show_recommend_problem',
						style: 'primary',
					},
					{
						action_type: 'submit_action',
						action_name: 'show_main_menu',
						type: 'button',
						value: 'show_main_menu',
						text: '처음으로',
						style: 'default',
					},
					{
						action_type: 'submit_action',
						action_name: 'help',
						type: 'button',
						value: 'help',
						text: '도움말 보기',
						style: 'default',
					},
				],
			});
			break;

		// 획득한 뱃지 보기
		case 'show_badge':
			// Array [GitHub id, Solved Count]
			var solvedNumArr = await getSolvedNumArr(react_user_id);

			var badge_list_block = [
				{
					type: 'header',
					text: '알고있니 (Algo-Git-니)',
					style: 'blue',
				},
				{
					type: 'image_link',
					url:
						'https://www.pewresearch.org/internet/wp-content/uploads/sites/9/2017/02/PI_2017.02.08_Algorithms_featured.png',
				},
				{
					type: 'text',
					text:
						'*구성원들이 획득한 뱃지 현황*\n\n해결한 문제 수가 늘어갈수록 더 좋은 뱃지를 획득할 수 있습니다.',
					markdown: true,
				},
				{
					type: 'divider',
				},
			];

			for (var i = 0; i < solvedNumArr.length; i++) {
				// 뱃지 계산
				var badge_image = null;
				var solvedProblem = solvedNumArr[i][1];
				switch (true) {
					case 0 <= solvedProblem && solvedProblem < 10: // 브론즈
						badge_image = bronze_badge;
						break;
					case 10 <= solvedProblem && solvedProblem < 30: // 실버
						badge_image = silver_badge;
						break;
					case 30 <= solvedProblem && solvedProblem < 50: // 골드
						badge_image = gold_badge;
						break;
					case 50 <= solvedProblem && solvedProblem < 70: // 플레티넘
						badge_image = platinum_badge;
						break;
					case 70 <= solvedProblem && solvedProblem < 100: // 다이아몬드
						badge_image = diamond_badge;
						break;
					case 100 <= solvedProblem && solvedProblem < 150: // 마스터
						badge_image = master_badge;
						break;
					case 150 <= solvedProblem && solvedProblem < 200: // 그랜드마스터
						badge_image = grand_master_badge;
						break;
					case 200 <= solvedProblem: // 챌린저
						badge_image = challenger_badge;
						break;
				}

				badge_list_block.push(
					{
						type: 'section',
						content: {
							type: 'text',
							text: `*${solvedNumArr[i][0]}*\n- 총 ${solvedNumArr[i][1]}문제 해결`,
							markdown: true,
						},
						accessory: {
							type: 'image_link',
							url: badge_image,
						},
					},
					{
						type: 'divider',
					}
				);
			}

			// 메인 메뉴 3개 추가
			badge_list_block.push(
				{
					type: 'button',
					text: '획득한 뱃지 보기',
					style: 'primary',
					action_type: 'submit_action',
					action_name: 'show_badge',
					value: 'show_badge',
				},
				{
					type: 'button',
					text: '추천 문제 받기',
					style: 'primary',
					action_type: 'submit_action',
					action_name: 'show_recommend_problem',
					value: 'show_recommend_problem',
				},
				{
					action_type: 'submit_action',
					action_name: 'show_main_menu',
					type: 'button',
					value: 'show_main_menu',
					text: '처음으로',
					style: 'default',
				},
				{
					type: 'button',
					text: '도움말 보기',
					style: 'default',
					action_type: 'submit_action',
					action_name: 'help',
					value: 'help',
				}
			);

			libKakaoWork.sendMessage({
				conversationId: message.conversation_id,
				text: '알고있니 (Algo-Git-니)',
				blocks: badge_list_block,
			});
			break;

		// 추천 문제 받아보기
		case 'show_recommend_problem':
			// Array [Problem Number, Solved Count]
			var mostSolvedProblemArr = await getMostSolvedProblemArr();
			var problem_list_block = [
				{
					type: 'header',
					text: '알고있니 (Algo-Git-니)',
					style: 'blue',
				},
				{
					type: 'image_link',
					url:
						'https://www.pewresearch.org/internet/wp-content/uploads/sites/9/2017/02/PI_2017.02.08_Algorithms_featured.png',
				},
				{
					type: 'text',
					text:
						'*이런 문제, 알고있니?*\n\n알고있니 봇 사용자들의 해결 횟수 TOP 5 백준 온라인 문제를 추천해드립니다.',
					markdown: true,
				},
				{
					type: 'divider',
				},
				{
					type: 'description',
					term: '1위\n',
					content: {
						type: 'text',
						text: `*${mostSolvedProblemArr[0][0]}*번 (${mostSolvedProblemArr[0][1]}회 해결)`,
						markdown: true,
					},
				},
				{
					type: 'description',
					term: '2위',
					content: {
						type: 'text',
						text: `*${mostSolvedProblemArr[1][0]}*번 (${mostSolvedProblemArr[1][1]}회 해결)`,
						markdown: true,
					},
				},
				{
					type: 'description',
					term: '3위',
					content: {
						type: 'text',
						text: `*${mostSolvedProblemArr[2][0]}*번 (${mostSolvedProblemArr[2][1]}회 해결)`,
						markdown: true,
					},
				},
				{
					type: 'description',
					term: '4위',
					content: {
						type: 'text',
						text: `*${mostSolvedProblemArr[3][0]}*번 (${mostSolvedProblemArr[3][1]}회 해결)`,
						markdown: true,
					},
				},
				{
					type: 'description',
					term: '5위',
					content: {
						type: 'text',
						text: `*${mostSolvedProblemArr[4][0]}*번 (${mostSolvedProblemArr[4][1]}회 해결)`,
						markdown: true,
					},
				},
				{
					type: 'divider',
				},
				{
					type: 'button',
					text: '획득한 뱃지 보기',
					action_type: 'submit_action',
					action_name: 'show_badge',
					value: 'show_badge',
					style: 'primary',
				},
				{
					type: 'button',
					text: '추천 문제 받기',
					action_type: 'submit_action',
					action_name: 'show_recommend_problem',
					value: 'show_recommend_problem',
					style: 'primary',
				},
				{
					action_type: 'submit_action',
					action_name: 'show_main_menu',
					type: 'button',
					value: 'show_main_menu',
					text: '처음으로',
					style: 'default',
				},
				{
					action_type: 'submit_action',
					action_name: 'help',
					type: 'button',
					value: 'help',
					text: '도움말 보기',
					style: 'default',
				},
			];
			libKakaoWork.sendMessage({
				conversationId: message.conversation_id,
				text: '알고있니 (Algo-Git-니)',
				blocks: problem_list_block,
			});
			break;

		case 'help':
			// 도움말 보기 모달 전송 (미구현)
			libKakaoWork.sendMessage({
				conversationId: message.conversation_id,
				text: '알고있니 (Algo-Git-니)',
				blocks: [
					{
						type: 'header',
						text: '알고있니 (Algo-Git-니)',
						style: 'blue',
					},
					{
						type: 'image_link',
						url:
							'https://www.pewresearch.org/internet/wp-content/uploads/sites/9/2017/02/PI_2017.02.08_Algorithms_featured.png',
					},
					{
						type: 'text',
						text: '*1. 커밋 챌린지 기능*',
						markdown: true,
					},
					{
						type: 'text',
						text:
							'GitHub 아이디를 입력하면, 일일 커밋 챌린지에 참여하게 됩니다. 일일 커밋 챌린지는 아래와 같은 기능을 제공합니다.\n',
						markdown: true,
					},
					{
						type: 'text',
						text:
							'*⚠️  일일 커밋 알림*\n매일 밤 일정 시각에 자신의 커밋 여부에 따라 커밋 활동 알림을 전송하여 1일 1커밋을 유지할 수 있게끔 도와줍니다.',
						markdown: true,
					},
					{
						type: 'text',
						text:
							'*📊  커밋 리포트*\n알고있니 봇을 사용하는 모든 사용자들의 데이터 기반으로, 오늘의 내 커밋 횟수, 랭킹, 이달의 목표 달성률 정보를 알려주어 활발한 커밋 문화를 조성합니다.',
						markdown: true,
					},
					{
						type: 'divider',
					},
					{
						type: 'text',
						text: '*2. PS 스터디 기능*',
						markdown: true,
					},
					{
						type: 'text',
						text:
							'등록된 GitHub Repo 에 푼 문제를 커밋 & 푸시하면, DB 에 문제 데이터가 생성됩니다. 이에 따라 아래와 같은 기능들을 제공합니다.\n',
						markdown: true,
					},
					{
						type: 'text',
						text:
							'*🥇  획득한 뱃지 보기*\n구성원들 각각이 몇 문제를 풀었는지에 따라 롤 티어 뱃지를 부여해드립니다.',
						markdown: true,
					},
					{
						type: 'text',
						text:
							'*🎁  추천 문제 받기*\n알고있니 봇을 사용하는 모든 사용자들의 데이터 기반으로, 가장 많이 푼 백준 온라인 문제를 추천해드립니다.',
						markdown: true,
					},
				],
			});

			break;

		default:
	}

	res.json({ result: true });
});

async function getSolvedNumArr(userId) {
	console.log(userId);
	let aUser = await User.findOne({ kakaowork_id: userId });
	var returnArr = [];

	if (aUser == null) console.log('해당 id를 가진 유저가 없습니다. 오류!');
	else {
		let targetRepo = aUser.repo_url;

		var users = await User.find({});

		//[key, problemdict[key]]
		users.forEach((element) => {
			var userInfo = [];

			if (element.repo_url == targetRepo) {
				userInfo.push(element.github_id);
				userInfo.push(String(element.problem.length));
				returnArr.push(userInfo);
			}
		});
		console.log(returnArr);
	}

	return returnArr;
}

async function getMostSolvedProblemArr() {
	var problemdict = {};
	let arr = await Problem.find({});

	arr.forEach((element) => {
		let userNum = element.user.length;
		problemdict[element.problem] = userNum;
	});

	var items = Object.keys(problemdict).map(function (key) {
		return [key, problemdict[key]];
	});

	if (items.length > 1) {
		items.sort(function (first, second) {
			return second[1] - first[1];
		});
	}

	var returnArr = [];

	for (var step = 0; step < 5 && step < items.length; step++) {
		var problemInfo = [];
		problemInfo.push(items[step][0]);
		problemInfo.push(items[step][1]);
		returnArr.push(problemInfo);
	}

	return returnArr;
}

// 자정에 csv 저장 및 user_info_data 값 업데이트
router.get('/midnight', async (req, res, next) => {
	// update user commits + rank and write to csv file
	user_info_data = await app.updateCSV(user_info_data);
	res.json({
		statusCode: 200,
	});
});

// 사용자에게 매일 특정 시간에 커밋 알람이 가게 설정

router.get('/commit', async (req, res, next) => {
	const users = await libKakaoWork.getUserList();
	const team19_users = [2611564, 2612127, 2612207, 2615809, 2610786, 2610805];

	user_info_data = app.readCSV();

	console.log('commit');

	// get a random url form baekjoon
	// const randomUrl = Math.floor(Math.random() * 19000 + 1000);
	// const url = 'https://www.acmicpc.net/problem/' + randomUrl.toString();

	var mostSolvedProblemArr = await getMostSolvedProblemArr();
	console.log(mostSolvedProblemArr);

	var problem_list_block = [
		{
			type: 'header',
			text: '알고있니 (Algo-Git-니)',
			style: 'blue',
		},
		{
			type: 'image_link',
			url:
				'https://www.pewresearch.org/internet/wp-content/uploads/sites/9/2017/02/PI_2017.02.08_Algorithms_featured.png',
		},
		{
			type: 'text',
			text:
				'*아직 커밋을 안 하셨군요?*\n\n알고있니 봇 사용자들이 뽑은 백준 온라인 추천 문제를 드립니다!',
			markdown: true,
		},
		{
			type: 'divider',
		},
		{
			type: 'description',
			term: '1위\n',
			content: {
				type: 'text',
				text: `*${mostSolvedProblemArr[0][0]}*번 (${mostSolvedProblemArr[0][1]}회 해결)`,
				markdown: true,
			},
		},
		{
			type: 'description',
			term: '2위',
			content: {
				type: 'text',
				text: `*${mostSolvedProblemArr[1][0]}*번 (${mostSolvedProblemArr[1][1]}회 해결)`,
				markdown: true,
			},
		},
		{
			type: 'description',
			term: '3위',
			content: {
				type: 'text',
				text: `*${mostSolvedProblemArr[2][0]}*번 (${mostSolvedProblemArr[2][1]}회 해결)`,
				markdown: true,
			},
		},
		{
			type: 'description',
			term: '4위',
			content: {
				type: 'text',
				text: `*${mostSolvedProblemArr[3][0]}*번 (${mostSolvedProblemArr[3][1]}회 해결)`,
				markdown: true,
			},
		},
		{
			type: 'description',
			term: '5위',
			content: {
				type: 'text',
				text: `*${mostSolvedProblemArr[4][0]}*번 (${mostSolvedProblemArr[4][1]}회 해결)`,
				markdown: true,
			},
		},
		{
			type: 'divider',
		},
		{
			type: 'button',
			action_type: 'submit_action',
			action_name: 'show_commit_challenge',
			value: 'show_commit_challenge',
			text: '커밋 챌린지 메뉴',
			style: 'default',
		},
		{
			action_type: 'submit_action',
			action_name: 'help',
			type: 'button',
			value: 'help',
			text: '도움말 보기',
			style: 'default',
		},
	];

	// conversations.map((conversation)=> {
	// 		libKakaoWork.sendMessage({
	// 			conversationId: conversation.id,
	// 			text: '알고있니 (Algo-Git-니)',
	// 			blocks: problem_list_block,
	// 		});
	// })

	user_info_data.map((conversation) => {
		console.log(conversation.today_count);
		var commit_cnt = -1;
		getHtml(conversation.git_id)
			.then((crawlData) => {
				var commitstring = JSON.stringify(crawlData.data);
				var commitlist = commitstring.substring(9, commitstring.length - 2).split(',');
				return commitlist[commitlist.length - 1];
			})
			.then((res) => {
				commit_cnt = res;
				if (commit_cnt == 0) {
					libKakaoWork.sendMessage({
						conversationId: conversation.conversation_id,
						text: '알고있니 (Algo-Git-니)',
						blocks: problem_list_block,
					});
				}
			});
	});
	// TODO : DB 에서 가장 많이 푼 문제 (추천 문제) 넘겨주는 방식으로
	// const message = await Promise.all([conversations.map((conversation) => {
	// libKakaoWork.sendMessage({
	// 	conversationId: conversation.id,
	// 	text: "1일 1커밋 알림",
	// 	blocks: [
	// 		{
	// 			"type": "header",
	// 			"text": "1일 1커밋",
	// 			"style": "blue"
	// 		},
	// 		{
	// 			"type": "text",
	// 			"text": "1일 1커밋을 하세요",
	// 			"markdown": true
	// 		},
	// 		{
	// 			"type": "button",
	// 			"text": "문제 풀러가기",
	// 			"style": "default",
	// 			"action_type": "open_system_browser",
	// 			"value": url
	// 		}
	// 	]
	// });

	// const message = await Promise.all([
	// 	conversations.map((conversation) => {

	// libKakaoWork.sendMessage({
	// 			conversationId: conversation.conversation_id,
	// 			text: '알고있니 (Algo-Git-니)',
	// 			blocks: [
	// 				{
	// 					type: 'header',
	// 					text: '커밋 챌린지 참여 안내',
	// 				},
	// 				{
	// 					type: 'text',
	// 					text: '에러가 발생하였습니다.\n다시 시도해 주세요',
	// 				},
	// 			],
	// 		});
	// 	}),
	// ]);
});

/*router.get('/commit-update', async (req, res, next) => {
	user_info_data.map((user_info)=> {
		axios.get('https://github-calendar.herokuapp.com/commits/' + tmp.git_id).then((crawlData) => {
			var today = new Date();
			var commitstring = JSON.stringify(crawlData.data);
			var commitlist = commitstring.substring(9, commitstring.length - 2).split(',');
			commitlist = commitlist.slice(
				commitlist.length - today.getDate() - 1,
				commitlist.length - 1
			);
			for (var i = 0; i < commitlist.length; i++) {
				console.log(i + 1 + '일: ' + commitlist[i]);
			}
			user_info.last_rank = user_info.today_rank;
			
			
		});
	})
});*/

module.exports = router;