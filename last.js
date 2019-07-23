var createGuard = require('./guard');
var isLast = require('./conditions/isLast');

module.exports = function last(fn, onSuccess, onError, onSupersede) {
	return createGuard(fn, {
		endCondition: isLast,
		onSuccess: onSuccess,
		onError: onError,
		onSupersede: onSupersede,
	});
};