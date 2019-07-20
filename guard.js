var Ruleset = require('./ruleset');

var stub = function() { return stub; };
stub.then = function() { return stub; };
stub.catch = function() { return stub; };
stub.finally = function() { return stub; };

function guard(fn, rules) {
	return function() {
		var ruleset = new Ruleset(rules);

		if (!ruleset.canStart(arguments)) return stub;

		try {
			var result = fn.apply(this, arguments);

			if (typeof result === 'function') {
				return guard(result, ruleset);
			}

			if (result instanceof Promise) {
				return new Promise(function(res, rej) {
					result.then(
						function(r) {
							if (ruleset.canResolve(r)) res(r);
						},
						function(r) {
							if (ruleset.canReject(r)) rej(r);
						}
					);
				});
			}

			if (ruleset.canResolve(result)) {
				return Promise.resolve(result);
			}

		} catch (e) {

			if (ruleset.canReject(e)) {
				return Promise.reject(e);
			}
		}
	};
}

module.exports = guard;