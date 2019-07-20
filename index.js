var guard = require('./guard');
var conditions = require('./conditions');
var Ruleset = require('./ruleset');

function last(fn) {
	return guard(fn, new Ruleset({
		endCondition: conditions.isMostRecent,
	}));
}

function first(fn) {
	return guard(fn, new Ruleset({
		startCondition: conditions.isIdle,
	}));
}

function distinct(fn, eqDepth) {
	return guard(fn, new Ruleset({
		startCondition: conditions.createHasNewArgsFn(eqDepth),
		endCondition: conditions.isMostRecent,
	}));
}

function deeplyDistinct(fn) {
	return distinct(fn, 1);
}

module.exports = function() { throw new TypeError("Don't use the default export"); };
module.exports.last = last;
module.exports.first = first;
module.exports.distinct = distinct;
module.exports.deeplyDistinct = deeplyDistinct;