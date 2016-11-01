/*
 * PairGroup Object
 */

export default class PairGroup {
	constructor(members) {
		this._members = members;
	}

	getMembers() {
		return this._members;
	}

	getMembersString() {
		return this._members.join(',');
	}
}
