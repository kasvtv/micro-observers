var createObserver = require('./observer');
var isLast = require('./conditions/isLast');

module.exports = function last(fn) {
	return createObserver(fn, {
		endCondition: isLast,
	});
};