function blockedByAsyncGuard() { return blockedByAsyncGuard; }

blockedByAsyncGuard.then = function() {
	return blockedByAsyncGuard;
};

blockedByAsyncGuard.catch = function(fn) {
	fn(blockedByAsyncGuard);
	return blockedByAsyncGuard;
};

blockedByAsyncGuard.finally = function(fn) {
	fn(blockedByAsyncGuard);
	return blockedByAsyncGuard;
};

module.exports = blockedByAsyncGuard;