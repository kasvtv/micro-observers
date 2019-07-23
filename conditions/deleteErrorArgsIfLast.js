var isLast = require('./isLast');
var equals = require('../utils/equals');
var cancel = require('../cancel');

module.exports = function deleteErrorArgsIfLast(depth, conf, args, result, e, prom) {
	if ((result === cancel || e)
		&& equals(conf.myArgs, conf.metrics.lastArgs, depth + 2)) {
		conf.metrics.lastArgs = [];
		return true;
	}

	return isLast(conf, args, result, e, prom);
};