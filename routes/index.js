//
// 커밋 횟수, 랭킹을 DB를 사용하지 않고
// 배열로 관리할 수도 있습니다!
//

var commit_cnt = []; // commit 횟수를 저장하는 배열

var study_menu_message = [
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
		text: '스터디 현황 보기',
		action_type: 'submit_action',
		action_name: 'show_study_data',
		value: 'show_study_data',
		style: 'primary',
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

// parameter: commit_cnt
// ranking 배열을 반환하는 함수
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

// 이 방식을 사용하려면 dictionary같은거를 써서
// git 닉네임에 인덱스를 부여해야 할 것 같아요
//

const express = require('express');
const router = express.Router();
const app = require('./app');

module.exports = router;

const libKakaoWork = require('../libs/kakaoWork');

// 커밋 챌린지 코드 작성 공간
router.use('/app', app);

router.get('/', async (req, res, next) => {
	/*
	 * 워크 스페이스에 있는 19팀을 찾아보았습니다.
	 * 워크스페이스 내 나뉘어진 부서들의 정보를 확인
	 * 연수생들은 4번째 idx안에 있는 것으로 판단됨.
	 * 근데 176명에 대해서 api를 호출하니 너무 느려서 중간에 끊깁니다ㅠ
	const departments = await libKakaoWork.checkDepartments();
	
	var userArr = departments[4].users_ids;
	var step, arrsize = userArr.length;
	console.log('총 연수생 : '+arrsize);
	for (step = 0; step<arrsize-1 ; step++){
		const a_user = await libKakaoWork.getUserInfo({userId:userArr[step]});
		
		//team19 id 저장
		if(a_user.name=='가동식' || a_user.name=='김현준' || a_user.name =='김형민' || a_user.name == '이주형' || a_user.name == '황수민' || a_user.name == '이현민'){
			team19_users.push(a_user.id);
		}		
	}
	*/
	/**
		현재 테스트 중이므로 모든 유저에게 보내는 것이 아닌, 팀원에게만 메세지를 보내도록 해야함
		-> users 내에 어떤 사람들이 있나 확인해봤는데, 다 관리자 분들만 계신 것 같아요-> 어떻게 하면 팀원들에게만 메시지를 보낼 수 있을까요...?
		-> 아하 그러면 개인 워크 스페이스에서 테스트를 해야 맞는걸까요?? 다른 팀들은 어떻게 진행하시지 ㅠㅠ - 현준
		-> 어찌저찌 해보니 위에 코드로 id를 찾아냈습니다!
		
		//가동식 : 2611564
		//김현준 : 2612127
		//김형민 : 2612207
		//이주형 : 2615809
		//황수민 : 2610786
		//이현민 : 2610805
	
	**/
	// 유저 목록 검색 (1)
	const users = await libKakaoWork.getUserList();
	const team19_users = [/*2611564,*/ 2612127 /*,2612207,2615809,2610786,2610805 */];

	//누가 이 workspace 내에 있나 확인
	//users.map((user) => {console.log(user.id + user.name);});

	//우리 팀
	console.log(team19_users);

	// 검색된 모든 유저에게 각각 채팅방 생성 (2)
	//현재 팀에게만 메시지를 보냅니다.
	const conversations = await Promise.all(
		//users.map((user) => libKakaoWork.openConversations({userId:user.id}))
		team19_users.map((userid) => libKakaoWork.openConversations({ userId: userid }))
	);

	// 생성된 채팅방에 메세지 전송 (3)

	const messages = await Promise.all([
		conversations.map((conversation) =>
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
						text: '커밋 챌린지 개설하기',
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
			})
		),
	]);

	res.json({ team19_users, conversations, messages });
});

// 등록된 웹훅 통해서 푸시 이벤트 발생했을 때 진입
router.post('/webhook-push', async (req, res, next) => {
	const { message, value } = req.body;

	res.json({});
});

router.post('/request', async (req, res, next) => {
	const { message, value } = req.body;
	switch (value) {
		case 'create_commit_challenge':
			// 커밋 챌린지 개설 모달 전송 (미구현)

			// - 1. 달성률 보기 -> 예를들어 한달에 얼마나 달성했는지 + 일정 횟수 이상 채웠을 때마다 뱃지 이미지 전송 등
			// nickname --> https://github.com/{nickname} -> 크롤링... -> 30일 간 커밋 기록 가져오기(달성률)
			// <rect width="11" height="11" x="-35" y="75" class="ContributionCalendar-day" rx="2" ry="2" data-count="1" data-date="2021-04-23" data-level="1"></rect>
			// 설문에서 본인의 깃허브 데이터의 제공과 공개에 동의합니다. - 개인정보

			// - 2. 랭킹 바뀌었을 때 (순위 떨어졌을 때 ?) 알림
			//   자정에 집계

			// - 3. 랭킹 (사용자 요청 시)
			//   오늘의 랭킹 DB에서 불러오기
			//	 상위 x명의 이달의 커밋 횟수
			//   내 랭킹/전체 랭킹
			// 	 내 커밋 횟수 / 나보다 위인 사람의 커밋 횟수

			// - 4. 1일 1커밋 부추기기 (독촉)
			// PM 10:00 정도부터 커밋 여부 체크해서 안했으면 알림

			// 시간 남으면 추가: 뱃지

			// 등록 -> 그 달의 커밋을 미리 체크 -> DB
			// 갱신 -> 자정에 체크했을 때 가장 최신 커밋이 그 날의 커밋이면 + 1
			// DB 명세: 이름(String), 닉네임(String), 커밋횟수(int), 전날의 랭킹(int), 오늘의 랭킹(int)
			// 매달마다 커밋횟수만 초기화

			return res.json({
				view: {
					//이름, Repo URL
					// \(^오^)/
					title: 'modal title',
					accept: '확인',
					decline: '취소',
					value: '{request_modal의 응답으로 전송한 value 값}',
					blocks: [
						{
							type: 'label',
							text: '커밋 챌린지 개설하기',
							markdown: true,
						},
						{
							type: 'label',
							text: '이름',
							markdown: true,
						},
						{
							type: 'input',
							name: 'user_name',
							required: true,
							placeholder: '본인의 이름을 입력해주세요.',
						},
						{
							type: 'label',
							text: 'Git 닉네임',
							markdown: true,
						},
						{
							type: 'input',
							name: 'git_name',
							required: true,
							placeholder: 'ex) Algo-Git-Ni',
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
							placeholder: 'https://github.com/ps-stydy/Algo-Git-Ni',
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

// // 응답값은 자유롭게 작성하셔도 됩니다.
// res.json({
// 	users,
// 	conversations,
// 	messages,
// });

router.post('/callback', async (req, res, next) => {
	const { message, actions, action_time, value } = req.body;
	switch (value) {
		case 'create_ps_study_results':
			const axios = require('axios');
			axios
				.get(actions.repo_url)
				.then((Response) => {
					console.log(Response.status);
					// 만약 유효한 레포를 입력받았을 경우 (성공)
					if (Response.status == 200) {
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
									text:
										'성공적으로 Repo 가 확인되었습니다. 해당 Repo 로 스터디를 진행하시겠습니까?',
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
							text: '알고있니 봇',
							blocks: [
								{
									type: 'button',
									text: '다시하셈 ㅋㅋ',
									style: 'default',
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
				text: '알고있니 봇',
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
							'원활한 스터디 진행을 위해서는 GitHub Repo 에 WebHook 을 필수적으로 세팅해줘야 합니다. 아래 문서를 참고하여, 설정을 완료해주세요!\n',
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
				text: '알고있니 봇',
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
						text: '*📝 PS (알고리즘) 스터디 진행 안내*',
						markdown: true,
					},
					{
						type: 'text',
						text: '원하시는 메뉴를 선택해주세요!\n',
						markdown: true,
					},
					{
						type: 'button',
						text: '스터디 현황 보기',
						action_type: 'submit_action',
						action_name: 'show_study_data',
						value: 'show_study_data',
						style: 'primary',
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
				],
			});
			break;

		case 'help':
			// 도움말 보기 모달 전송 (미구현)
			console.log('Help Submit');
			break;

		default:
	}

	res.json({ result: true });
});