function guard(fn, rules={}) {
	let calls = rules.calls || {current: 0};
	let lastCallFinished = rules.lastCallFinished || {current: 0};
	
	return function () {
		try {
			const callsAtStart = rules.callsAtStart || {current: ++calls.current};

			const result = fn.apply(this, arguments);
		
			if (result instanceof Promise) {
				let cb, errorCb;
				const proxyPromise = new Promise((res, rej) => {
					cb = function(x) {
						if (rules.latest && calls.current !== callsAtStart.current) return;
						res(x);
					};
					errorCb = function(x) {
						if (rules.latest && calls.current === callsAtStart.current) return;
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
					lastCallFinished
				}, rules));
			}

			lastCallFinished = callsAtStart;
			return Promise.resolve(result);
		} catch (e) {
			return Promise.reject(e);
		}
	}
}

function latest(fn) {
	return guard(fn, { latest: true });
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
const latestFn = latest(fn)

const a = latestFn(1)
const b = a(2)
b.then(console.log)


const c = latestFn(3)
const d = c(4)
d.then(console.log)