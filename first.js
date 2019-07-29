var createObserver = require('./observer');
var isIdle = require('./conditions/isIdle');

module.exports = function first(fn) {
	return createObserver(fn, {
		startCondition: isIdle,
	});
};