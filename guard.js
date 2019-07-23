var cancel = require('./cancel');
var stub = require('./utils/stub');

function createGuard(fn, inputConf) {
	var conf = Object.assign({}, inputConf);

	conf.metrics = conf.metrics || { lastProm: null };

	conf.startCondition = conf.startCondition || returnTrue;
	conf.endCondition = conf.endCondition || returnTrue;

	conf.onSuccess = conf.onSuccess || identity;
	conf.onError = conf.onError || identity;
	conf.onSupersede = conf.onSupersede || identity;

	return function() {
		var myConf = Object.assign({}, conf);

		function finish(result, e, prom, myArgs) {
			if (myConf.endCondition(myConf, myArgs, result, e, prom) && result !== cancel) {
				if (e) myConf.onError(e);
				else myConf.onSuccess(result);
			}

			if (myConf.metrics.lastProm === prom) myConf.metrics.lastProm = null;

			if (e) return Promise.reject(e);
			return Promise.resolve(result);
		}

		if (myConf.startCondition(myConf, arguments)) {
			var output;

			try {
				output = fn.apply(this, arguments);
			} catch (e) {
				return finish(null, e, null, arguments);
			}

			if (typeof output === 'function') {
				return createGuard(output, myConf);
			}

			var lastProm = myConf.metrics.lastProm;
			myConf.metrics.lastProm = null;
			if (lastProm) myConf.onSupersede(lastProm);

			if (output instanceof Promise) {
				myConf.metrics.lastProm = output;
				return output.then(
					function(r) { return finish(r, null, output, arguments); }
				).catch(
					function(e) { return finish(null, e, output, arguments); }
				);
			}

			return finish(output, null, null, arguments);
		}

		return stub;
	};
}

function returnTrue() {
	return true;
}
function identity(x) {
	return x;
}

module.exports = createGuard;