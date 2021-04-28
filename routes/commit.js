const csv = require('csv-parser');
const fs = require('fs');

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

// 사용자가 챌린지에 참여해 있는지 확인하는 함수
// users: 사용자 리스트와 커밋 횟수가 담겨 있는 object (index.js의 commit_cnt)
// id: 사용자의 github id
checkUserExist = function(users, id) {
	for (var i = 0; i < users.length; i++) {
		if (users[i].id == id) return true;
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


module.exports = {
	readCSV,
	checkUserExist,
	getUserCommits,
	getAllCommits,
	getYearlyCommits,
	writeMonthlyData
};