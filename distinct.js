var createGuard = require('./guard');
var hasNewArgs = require('./conditions/hasNewArgs');
var deleteErrorArgsIfLast = require('./conditions/deleteErrorArgsIfLast');

module.exports = function distinct(fn, onSuccess, onError, onSupersede, depth) {
	return createGuard(fn, {
		startCondition: hasNewArgs.bind(null, depth || 0),
		endCondition: deleteErrorArgsIfLast.bind(null, depth || 0),
		onSuccess: onSuccess,
		onError: onError,
		onSupersede: onSupersede,
	});
};