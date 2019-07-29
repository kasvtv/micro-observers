var cancel = require('./cancel');
var stub = require('./utils/stub');

function createObserver(fn, inputConf) {
	var conf = Object.assign({}, inputConf);

	conf.startCondition = conf.startCondition || function() { return true; };
	conf.endCondition = conf.endCondition || function() { return true; };

	conf.metrics = conf.metrics || { lastProm: null };

	conf.subscriptions = {
		success: [],
		error: [],
		supersede: [],
	};

	var ret = function() {
		var myConf = Object.assign({}, conf);

		function finish(result, e, prom, myArgs) {
			if (myConf.endCondition(myConf, myArgs, result, e, prom) && result !== cancel) {
				if (e) myConf.subscriptions.error.forEach(function(f) { f(e); });
				else myConf.subscriptions.success.forEach(function(f) { f(result); });
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
				return createObserver(output, myConf);
			}

			var lastProm = myConf.metrics.lastProm;
			myConf.metrics.lastProm = null;
			if (lastProm) myConf.subscriptions.supersede.forEach(function(f) { f(lastProm); });

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

	ret.subscribe = function(opts) {
		if (opts.success) conf.subscriptions.success = conf.subscriptions.success.concat(opts.success);
		if (opts.error) conf.subscriptions.error = conf.subscriptions.error.concat(opts.error);
		if (opts.supersede) conf.subscriptions.supersede = conf.subscriptions.supersede.concat(opts.supersede);

		return function unsubscribe() {
			if (opts.success) conf.subscriptions.success = conf.subscriptions.success.filter(opts.success);
			if (opts.error) conf.subscriptions.error = conf.subscriptions.error.filter(opts.error);
			if (opts.supersede) conf.subscriptions.supersede = conf.subscriptions.supersede.filter(opts.supersede);
		};
	};

	return ret;
}

module.exports = createObserver;