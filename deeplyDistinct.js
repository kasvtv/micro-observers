var distinct = require('./distinct');

module.exports = function deeplyDistinct(fn, onSuccess, onError, onSupersede) {
	return distinct(fn, onSuccess, onError, 1);
};