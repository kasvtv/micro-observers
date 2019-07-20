const stub = function(){ return stub };
stub.then = function() { return stub };
stub.catch = function() { return stub };
stub.finally = function() { return stub };

function guard(fn, rules={}) {
	let calls = rules.calls || {current: 0};
	let lastCallFinished = rules.lastCallFinished || {current: 0};
	let lastArgs = rules.lastArgs || {current: []};
	
	return function () {
		if (
			rules.first
			|| (rules.distinct && rules.equalityFunction(lastArgs, arguments))
			&& lastCallFinished.current !== calls.current
		) return stub;

		const callsAtStart = rules.callsAtStart || {current: ++calls.current};
		lastArgs = arguments;

		try {
			const result = fn.apply(this, arguments);
		
			if (result instanceof Promise) {
				let cb, errorCb;
				const proxyPromise = new Promise((res, rej) => {
					cb = function(x) {
						if (rules.last && calls.current !== callsAtStart.current) return;
						res(x);
					};
					errorCb = function(x) {
						if (rules.last && calls.current === callsAtStart.current) return;
						rej(x);
					};
				});
		
				result.then(cb, errorCb);
				return proxyPromise;
			}
			
			if (typeof result === "function") {
				return guard(result, Object.assign({
					calls,
					callsAtStart,
					lastCallFinished,
					lastArgs
				}, rules));
			}

			lastCallFinished.current = callsAtStart;
			return Promise.resolve(result);

		} catch (e) {

			lastArgs = [];
			lastCallFinished.current = callsAtStart;
			return Promise.reject(e);
		}
	}
}

function last(fn) {
	return guard(fn, { last: true });
}

function first(fn) {
	return guard(fn, { first: true });
}

const fn = function(a) {
	return async function(b) {
		await new Promise(x => setTimeout(x, 1000));
		console.log("await done")
		return [a,b];
    }
};
const lastFn = last(fn)

const a = lastFn(1)
const b = a(2)
b.then(console.log)


const c = lastFn(3)
const d = c(4)
d.then(console.log)