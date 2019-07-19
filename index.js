function bindCb(fn, cb, errorCb, proxyPromise) {
	return function() {
		let result, error;

		try {
			result = fn.apply(this, arguments);
		} catch (e) {
			error = e;
		}

		if (error) {
			errorCb(error);
			throw error;
		}
		
		if (result instanceof Promise) {
			result.then(cb);
			result.catch(errorCb);
			return proxyPromise;
		}
		
		if (typeof result === "function") {
			return bindCb(result, cb, errorCb, proxyPromise);
		}
		
		cb(result);
		return result;
	}
}

function latest(fn) {
	let count = 0;
	
	return function () {
		count = count + 1;
		const countAtStart = count;
		console.log("starting", {countAtStart, count})

		let resolve, reject;
		const proxyPromise = new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		});

		return bindCb(
			fn,
			x => {
				console.log("done", {count, countAtStart});
				if (count === countAtStart) resolve(x);
			},
			x => {
				if (count === countAtStart) reject(x);
			},
			proxyPromise
		).apply(this, arguments);
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