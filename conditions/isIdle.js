module.exports = function isIdle(conf) {
	return !conf.metrics.lastProm;
};