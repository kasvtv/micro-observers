module.exports = function isLast(conf, args, result, e, prom) {
	return (!prom && !conf.metrics.lastProm)
	||
	(prom && conf.metrics.lastProm === prom);
};