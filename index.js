function latest(fn, prev={}) {
	let invocations = prev.invocations || {current: 0};
	
	return function () {
		try {
			const invocationsAtStart = prev.invocationsAtStart || {current: ++invocations.current};

			const result = fn.apply(this, arguments);
		
			if (result instanceof Promise) {
				let cb, errorCb;
				const proxyPromise = new Promise((res, rej) => {
					cb = function(x) {
						if (invocations.current === invocationsAtStart.current) res(x);
					};
					errorCb = function(x) {
						if (invocations.current === invocationsAtStart.current) rej(x);
					};
				});
		
				result.then(cb);
				result.catch(errorCb);
				return proxyPromise;
			}
			
			if (typeof result === "function") {
				return latest(result, { invocations, invocationsAtStart });
			}

			return Promise.resolve(result);
		} catch (e) {
			return Promise.reject(e);
		}
	}
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