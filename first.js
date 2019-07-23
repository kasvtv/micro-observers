var createGuard = require('./guard');
var isIdle = require('./conditions/isIdle');

module.exports = function first(fn, onSuccess, onError) {
	return createGuard(fn, {
		startCondition: isIdle,
		onSuccess: onSuccess,
		onError: onError,
	});
};