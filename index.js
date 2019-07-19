function latest(fn) {
	let count = 0;
	
	return function () {
		count = count + 1;
		const countAtStart = count;

		const result = fn.apply(this, arguments);
	
		if (result instanceof Promise) {
			let cb, errorCb;
			const proxyPromise = new Promise((res, rej) => {
				cb = function(x) {
					if (count === countAtStart) res(x);
				};
				errorCb = function(x) {
					if (count === countAtStart) rej(x);
				};
			});
	
			result.then(cb);
			result.catch(errorCb);
			return proxyPromise;
		}
		
		if (typeof result === "function") {
			return latest(result);
		}

		return result;
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