const csv = require('csv-parser');
const fs = require('fs');
const axios = require('axios');

// csv 파일의 데이터를 불러오는 함수
// user_info.csv 파일의 데이터를 불러옴
readCSV = function () {
	const results = [];
	// csv({ separator: '\t' })
	fs.createReadStream('user_info.csv')
		.pipe(csv())
		.on('data', (data) => results.push(data))
		.on('end', () => console.log(results));
	console.log(typeof(results));
	return results;
}

// 사용자가 입력한 github id가 챌린지에 참여해 있는지 확인하는 함수
// users: 사용자 리스트와 커밋 횟수가 담겨 있는 object (index.js의 commit_cnt)
// id: 사용자의 github id
checkUserExist = function(users, id) {
	for (var i = 0; i < users.length; i++) {
		if (users[i].git_id == id) return true;
	}
	return false;
}

// 사용자가 이미 챌린지에 참여해 있는지 확인하는 함수
// users: 사용자 리스트와 커밋 횟수가 담겨 있는 object (index.js의 commit_cnt)
// conversation_id: 사용자의 conversation id
checkConversationExist = function(users, conversationId) {
	for (var i = 0; i < users.length; i++) {
		if (users[i].conversation_id == conversationId) return true;
	}
	return false;
}

// 지난 한달간 사용자가 커밋한 횟수를 쿼리하는 함수
// id: 사용자의 github id
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

// 사용자가 커밋한 전체 횟수를 쿼리하는 함수
// id: 사용자의 github id
getAllCommits = async (id) => {
	const url = "https://github-calendar.herokuapp.com/commits/" + id;
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

// 사용자가 지난 1년간 커밋한 횟수를 쿼리하는 함수
// id: 사용자의 github id
getYearlyCommits = async (id) => {
	const url = "https://github-calendar.herokuapp.com/total/" + id;
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

writeMonthlyData = async (id) => {
	const url = "https://github-calendar.herokuapp.com/commits/last/" + id;
	var data;
	data = commits = await axios
		.get(url)
		.then((Response) => {
		return Response.data.data;
	});
	return data;
}

// 오늘의 커밋을 구하는 함수
getTodayCommits = async (userData) => {
	var returnData;
	async function awaitAPI (userData) {
		for (const user of userData) {
			const url = "https://github-calendar.herokuapp.com/commits/last/" + user.git_id;
			todayCommit = await axios
				.get(url)
				.then((Response) => {
					data = Response.data.data;
					return data[30];
				});
			if (todayCommit) user.today_count += 1;
		}
	};
	return userData;
}

// 랭크를 구하는 함수
// return an array with rank
getTodayRanks = async (userData) => {
	var rank = [];
	userData = await getTodayCommits(userData);
	var n = userData.length;
	
	for (var i = 0; i < n; i++) rank[i] = 1;
	
	for (var i = 0; i < n; i++) {
		for (var j = 0; j < n; j++) {
			if (userData[i].today_count < userData[j].today_count) rank[i]++;
		}
	}
	
	for (var i = 0; i < n; i++) {
		userData[i].last_rank = userData[i].today_rank;
		userData[i].today_rank = rank[i];
	}
	
	return userData;
}


// csv에 write하는 함수
updateCSV = async (userData) => {
	userData = await getTodayRanks(userData);
	
	var data = "conversation_id,git_id,today_count,today_rank,last_rank\n";
	userData.forEach(user => {
		data += `${user.conversation_id},${user.git_id},${user.today_count},${user.today_rank},${user.last_rank}\n`;
	});
	
	fs.writeFile('user_info.csv', data, function (err) {
		if (err) throw err;
	});
	
	return userData;
}

// user_info_data, conversation_id, git_id를 받아 csv에 적고 user_info_data 및 commit_cnt에 push
initialUserInput = async (userData, conversation_id, git_id) => {
	var returnData = await axios.get('https://github-calendar.herokuapp.com/commits/' + git_id)
		.then((Response) => {
			var today = new Date();
			var commit_cnt = 0;
			var commitstring = JSON.stringify(Response.data);
			var commitlist = commitstring.substring(9, commitstring.length - 2).split(',');

			commitlist = commitlist.slice(
				commitlist.length - today.getDate() - 1,
				commitlist.length - 1
			);
			
			for (var i = 0; i < commitlist.length - 1; i++) {
				if (commitlist[i] != 0) commit_cnt++;
			}

			userData.push(
				{conversation_id: conversation_id, git_id: git_id, today_count: commit_cnt, today_rank: 0, last_rank: 0}
			);

			return userData;
		});
	
	returnData = await updateCSV(returnData);
	
	return returnData;
}


module.exports = {
	readCSV,
	checkUserExist,
	checkConversationExist,
	getUserCommits,
	getAllCommits,
	getYearlyCommits,
	writeMonthlyData,
	updateCSV,
	initialUserInput
};