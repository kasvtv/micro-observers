var equals = require('../utils/equals');

module.exports = function hasNewArgs(depth, conf, args) {
	if (!conf.metrics.lastArgs) conf.metrics.lastArgs = [];
	if (!conf.myArgs) conf.myArgs = [];

	conf.myArgs = conf.myArgs.concat(args);

	if (
		conf.myArgs.length === conf.metrics.lastArgs.length
		&& equals(conf.myArgs, conf.metrics.lastArgs, depth + 2)
	) return false;

	conf.metrics.lastArgs[conf.myArgs.length - 1] = args;

	return true;
};