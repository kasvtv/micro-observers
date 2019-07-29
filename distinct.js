var createObserver = require('./observer');
var hasNewArgs = require('./conditions/hasNewArgs');
var deleteErrorArgsIfLast = require('./conditions/deleteErrorArgsIfLast');

module.exports = function distinct(fn, depth) {
	return createObserver(fn, {
		startCondition: hasNewArgs.bind(null, depth || 0),
		endCondition: deleteErrorArgsIfLast.bind(null, depth || 0),
	});
};