function blockedByMicroObserver() { return blockedByMicroObserver; }

blockedByMicroObserver.then = function() {
	return blockedByMicroObserver;
};

blockedByMicroObserver.catch = function(fn) {
	fn(blockedByMicroObserver);
	return blockedByMicroObserver;
};

blockedByMicroObserver.finally = function(fn) {
	fn(blockedByMicroObserver);
	return blockedByMicroObserver;
};

module.exports = blockedByMicroObserver;