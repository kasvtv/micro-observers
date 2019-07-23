[![NPM version](https://img.shields.io/npm/v/async-guards.svg?style=flat)](https://www.npmjs.org/package/async-guards)
[![Size](https://badgen.net/bundlephobia/minzip/async-guards)](https://bundlephobia.com/result?p=async-guards)
[![Build Status](https://travis-ci.com/kasvtv/async-guards.svg?branch=master)](https://travis-ci.com/kasvtv/async-guards)
[![Coverage Status](https://coveralls.io/repos/github/kasvtv/async-guards/badge.svg?branch=master)](https://coveralls.io/github/kasvtv/async-guards?branch=master)
[![Dependency Status](https://david-dm.org/kasvtv/async-guards.svg)](https://david-dm.org/kasvtv/async-guards)
[![Known Vulnerabilities](https://snyk.io/test/github/kasvtv/async-guards/badge.svg?targetFile=package.json)](https://snyk.io/test/github/kasvtv/async-guards?targetFile=package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

# async-guards
Multiple asynchronous request don't return in deterministic order. *"Duh!"*, you might say. Well, lots of web applications don't take this into account, with weirdly behaving web applications as a result.

- *Ever mashed a button on a webpage and then saw results flash in succession right after? Maybe the result that stayed wasn't from the last click?*

- *Ever had the results of a search-on-type field be replaced by something you typed before, because an early request finished last?*

This library is there to fix these issues forever. It provides you with several "guards". A guard is a higher order functions taking your asynchronous function, the success callback and the error callback and returns a safer version of your function, only calling the success or error callback in certain situations.

## Installation

```bash
npm install async-guards
```

## API

### function **first**(fn, onSuccess, onError) -> safeFn

Guards an async function by only invoking it when it isn't currently running. In case of AJAX, this means the request will never actually be sent.

#### diagram

![First](https://raw.githubusercontent.com/kasvtv/async-guards/master/diagrams/first.svg?sanitize=true)

#### arguments
- **fn** *(function)*: Your async function
- **onSuccess** *(function)*: A success callback, that you would normally pass to .then
- **onError** *(function)*: An error callback, that you would normally pass to .catch

#### returns
- **safeFn** *(function)*: Your guarded async function, linked to its handlers.

#### example
```js
import first from 'async-guards/first';
import { refresh, showResults, showError } from '******';

const firstRefresh = first(
	refresh,
	showResults,
	showError
);

firstRefresh();

// Prevent refresh from being fired again before the previoius refresh has finished
```


### function **last**(fn, onSuccess, onError, onSupersede) -> safeFn

Guards an async function by only invoking its success or error handlers if the function wasn't called in the meantime. In case of AJAX, the request will always be made, just not handled in the frontend if it has been superseded by another request before arriving.

#### diagram

![Last](https://raw.githubusercontent.com/kasvtv/async-guards/master/diagrams/last.svg?sanitize=true)

#### arguments
- **fn** *(function)*: Your async function
- **onSuccess** *(function)*: A success callback, that you would normally pass to .then
- **onError** *(function)*: An error callback, that you would normally pass to .catch
- **onSupersede** *(function) (optional)*: Called every time a pending promise is superseded by a newly returned promise. Receives the old promise as its argument. Useful for cancelling xhr requests.

#### returns
- **safeFn** *(function)*: Your guarded async function, linked to its handlers.

#### example
```js
import last from 'async-guards/last';
import { refresh, showResults, showError } from '******';

const lastRefresh = last(
	refresh,
	showResults,
	showError
);

lastRefresh();

// Only resolve the latest refreshed results
```

### function **distinct**(fn, onSuccess, onError, onSupersede, depth) -> safeFn

Guards an async function by only invoking it when arguments are different than its last call. In case of AJAX, this means any request with new arguments will be made, but if another request with new arguments is made in the meantime, it will never be handled in the frontend.

#### diagram

![Distinct](https://raw.githubusercontent.com/kasvtv/async-guards/master/diagrams/distinct.svg?sanitize=true)

#### arguments
- **fn** *(function)*: Your async function
- **onSuccess** *(function)*: A success callback, that you would normally pass to .then
- **onError** *(function)*: An error callback, that you would normally pass to .catch
- **onSupersede** *(function) (optional)*: Called every time a pending promise is superseded by a newly returned promise. Receives the old promise as its argument. Useful for cancelling xhr requests.
- **depth** *(number) (optional)*: How many levels deep to check for equality. Default is 0, meaning shallow equality.

#### returns
- **safeFn** *(function)*: Your guarded async function, linked to its handlers.

#### example
```js
import distinct from 'async-guards/distinct';
import { login, startSession, showLoginError } from '******';

const safeLogin = distinct(
	fetchUser,
	startSession,
	showLoginError
);

safeLogin(username, password)

// A login request that's still in progress can now only be refired if it has new credentials and will supersede the previous request
```

### function **deeplyDistinct**(fn, success, error) -> safeFn

Shortcut for distinct(fn, success, error, 1)

## FAQ

- *What happens if a function from *first* or *distinct* is supressed? Will my app crash if I curry or call then/catch/finally on the result?*  
Your app won't crash. When the call is supressed, a dummy thenable is returned with then/catch/finally functions that don't actually do anything. This value can be imported (for equality checking) from `'async-guard/utils/stub'`

- *What about partially applied functions like with redux thunks?*  
Functions that immediately return other functions are supported.

- *What about functions that only sometimes return a Promise?*  
All return values are always wrapped in a Promise.

- *What if an error occurs in my transformed function?*  
Then a rejected Promise holding the error is returned.

- *What if halfway through my async function I decide to cancel it?*  
You can return a cancel token that you can import from `'async-guard/cancel'`.

## More examples

### Redux thunks
```js
import distinct from 'async-guards/distinct';
import { login } from 'api';
import { userSuccess, userFailure } from 'store/user/actions';

const safeLoginThunk = distinct(
	(username, password) => async (dispatch) => {
		try {
			const token = await login(username, password);
			return { dispatch, token };
		} catch (error) {
			return { dispatch, error };
		}
	},
	({dispatch, token}) => dispatch(userSuccess(token)),
	({dispatch, error}) => dispatch(userFailure(error))
);
```

### Cancellation token
```js
import last from 'async-guards/last';
import cancel from 'async-guards/cancel';
import { refresh, showResults, showError } from '******';

const lastRefresh = last(
	async (currentData) => {
		const data = await refresh();
		if (currentData.equals(data)) return cancel;

		return data;
	},
	showResults,
	showError
);
```

### Cancelling superseded requests with micro-xhr package
```js
/* lastMicroXhr.js */
import last from 'async-guards/last';

const lastMicroXhr = (fn, onSuccess, onError) => last(
	fn,
	onSuccess,
	onError,
	prom => prom.xhr.abort()
);

export default lastMicroXhr;

/* index.js */
import xhr from 'micro-xhr';
import lastMicroXhr from './lastMicroXhr';
import { showResults, showError } from '******';

const lastRefresh = lastMicroXhr(
	async (currentData) => {
		const data = await xhr({ url: 'https://my.domain.com' });
		if (currentData.equals(data)) return cancel;

		return data;
	},
	showResults,
	showError
);
```
