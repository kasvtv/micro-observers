const {
	first, last, distinct, deeplyDistinct,
} = require('.');
const cancel = require('./cancel');

const createMockFn = (errorIdx = []) => {
	let counter = 0;
	const fn = async (delay, val) => {
		await new Promise(r => setTimeout(r, delay));

		if (errorIdx.includes(counter++)) {
			throw val;
		}

		return val;
	};


	return fn;
};

test('last', async () => {
	const successVals = [];
	const fn = createMockFn();
	const lastFn = last(fn, (r) => successVals.push(r));

	await Promise.all([
		lastFn(100, 1),
		lastFn(200, 2),
		lastFn(150, 3),
	]);

	expect(successVals).toEqual([3]);
});

test('first', async () => {
	const successVals = [];
	const fn = createMockFn();
	const lastFn = first(fn, (r) => successVals.push(r));

	const a = lastFn(150, 1);
	const b = lastFn(200, 2);
	const c = lastFn(100, 3);

	await a;

	expect(successVals).toEqual([1]);
	expect(b instanceof Promise).toBe(false);
	expect(c instanceof Promise).toBe(false);
});

test('distinct', async () => {
	const vals = [];
	const fn = createMockFn();
	const lastFn = distinct(fn, (r) => vals.push(r));

	const a = lastFn(150, 1);
	const b = lastFn(150, 1);
	const c = lastFn(200, 2);
	const d = lastFn(200, 2);

	await Promise.all([a, c]);

	expect(vals).toEqual([2]);
	expect(b instanceof Promise).toBe(false);
	expect(d instanceof Promise).toBe(false);
});

test('cancel token', async () => {
	const vals = [];
	const fn = createMockFn();
	const lastFn = last(fn, (r) => vals.push(r));

	await lastFn(150, cancel);

	expect(vals).toEqual([]);
});