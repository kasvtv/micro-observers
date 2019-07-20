const { first, last, distinct } = require('.');

const fn = function(a) {
	return async function(b) {
		await new Promise(x => setTimeout(x, a));
		console.log('awaited');
		return [a, b];
	};
};
const lastFn = distinct(fn);

const a = lastFn(1000);
const b = a(1);
b.then(console.log);

const c = lastFn(2000);
const d = c(2);
d.then(console.log);

const e = lastFn(2000);
const f = e(3);
f.then(console.log);