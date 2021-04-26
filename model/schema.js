import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
		trim: true
	},
	problem: [int],
	url: {
		type: String
	}
});

const problemSchema = new mongoose.Schema({
	problem: {
		type: int
	},
	user: [String]
});

const User = new mongoose.model('User', userSchema);
const Problem = new mongoose.model('Problem', problemSchema);
export {User, Problem};