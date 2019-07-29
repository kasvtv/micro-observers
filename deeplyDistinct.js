var distinct = require('./distinct');

module.exports = function deeplyDistinct(fn) {
	return distinct(fn);
};