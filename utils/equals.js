module.exports = function equals(a, b, depth) {
	if (
		depth
		&& a && typeof a === 'object'
		&& b && typeof b === 'object'
	) {
		var aLength, bLength;

		if (a instanceof Array && b instanceof Array) {
			aLength = a.length;
			bLength = b.length;
		} else {
			aLength = Object.keys(a).length;
			bLength = Object.keys(b).length;
		}

		if (aLength !== bLength) return false;
		if (!aLength) return true;

		for (var ind in a) {
			if (!equals(a[ind], b[ind], depth - 1)) return false;
		}

		return true;
	}

	return a === b;
};