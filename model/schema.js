const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
		trim: true
	},
	problem: [String],
	url: {
		type: String
	}
});

const problemSchema = new mongoose.Schema({
	problem: {
		type: String
	},
	user: [String]
});

exports.User = new mongoose.model('User', userSchema);
exports.Problem = new mongoose.model('Problem', problemSchema);