const express = require('express');
const router = express.Router();

module.exports = router;

const libKakaoWork = require('../libs/kakaoWork');

// routes/index.js
const express = require('express');
const router = express.Router();

const libKakaoWork = require('../libs/kakaoWork');

router.get('/', async (req, res, next) => {
    // 유저 목록 검색 (1)
    const users = await libKakaoWork.getUserList();

    // 검색된 모든 유저에게 각각 채팅방 생성 (2)
    // const conversations = await Promise.all(
    //     users.map((user) => libKakaoWork.openConversations({ userId: user.id }))
    // );

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
                            'https://t1.kakaocdn.net/kakaowork/resources/block-kit/imagelink/image2@3x.jpg',
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
                        action_type: 'call_modal',
                        value: 'help',
                        text: '도움말 보기',
                        style: 'default',
                    },
                ],
            })
        ),
    ]);

    // 응답값은 자유롭게 작성하셔도 됩니다.
    res.json({
        users,
        conversations,
        messages,
    });
});
