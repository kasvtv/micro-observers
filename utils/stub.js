function blockedByAsyncGuard() { return blockedByAsyncGuard; }

blockedByAsyncGuard.then = function(fn) {
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