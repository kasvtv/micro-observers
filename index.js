module.exports = function() { throw new TypeError("Don't use the default export"); };
module.exports.last = require('./last');
module.exports.first = require('./first');
module.exports.distinct = require('./distinct');
module.exports.deeplyDistinct = require('./deeplyDistinct');