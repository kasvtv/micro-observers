function isMostRecent() {
	return (this.callsAtStart === this.calls.current);
}

function isIdle() {
	return (this.callsAtStart) || (this.lastCallFinished.current === this.calls.current);
}

function createHasNewArgsFn(depth) {
	return function hasNewArgs(fnArgs) {
		if (this.callsAtStart) return true;

		var temp = equals(fnArgs, this.lastArgs.current, (depth || 0) + 1);

		console.log(temp);

		return !temp;
	};
}

function equals(a, b, depth) {
	if (
		depth
		&& a && typeof a === 'object'
		&& b && typeof b === 'object'
	) {

		if (a instanceof Array && b instanceof Array) {
			if (a.length !== b.length) return false;
		} else if (Object.keys(a).length !== Object.keys(b).length) {
			return false;
		}

		for (var ind in a) {
			if (!equals(a[ind], b[ind], depth - 1)) return false;
		}

		return true;
	}

	return a === b;
}

module.exports.isMostRecent = isMostRecent;
module.exports.isIdle = isIdle;
module.exports.createHasNewArgsFn = createHasNewArgsFn;