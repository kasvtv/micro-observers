[![NPM version](https://img.shields.io/npm/v/micro-observers.svg?style=flat)](https://www.npmjs.org/package/micro-observers)
[![Size](https://badgen.net/bundlephobia/minzip/micro-observers)](https://bundlephobia.com/result?p=micro-observers)
[![Build Status](https://travis-ci.com/kasvtv/micro-observers.svg?branch=master)](https://travis-ci.com/kasvtv/micro-observers)
[![Coverage Status](https://coveralls.io/repos/github/kasvtv/micro-observers/badge.svg?branch=master)](https://coveralls.io/github/kasvtv/micro-observers?branch=master)
[![Dependency Status](https://david-dm.org/kasvtv/micro-observers.svg)](https://david-dm.org/kasvtv/micro-observers)
[![Known Vulnerabilities](https://snyk.io/test/github/kasvtv/micro-observers/badge.svg?targetFile=package.json)](https://snyk.io/test/github/kasvtv/micro-observers?targetFile=package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

# micro-observers
Multiple asynchronous request don't return in deterministic order. *"Duh!"*, you might say. Well, lots of web applications don't take this into account, with weirdly behaving web applications as a result.

- *Ever mashed a button on a webpage and then saw results flash in succession right after? Maybe the result that stayed wasn't from the last click?*

- *Ever had the results of a search-on-type field be replaced by something you typed before, because an early request finished last?*

This library is there to fix these issues forever. It provides you with several higher order functions that take an asynchronous function and return a constrained version of that function, to which success or error callbacks can be attached that are only invoked in certain situations.

This package solves **some** of the problems RxJS can solve, but in a **much** simpler and smaller package.

<br/>
<br/>

## Installation

```bash
npm install micro-observers
```

<br/>
<br/>


## API

### function **first**(fn) -> safeFn

Restricts an async function by only invoking its callbacks when it isn't currently running. In case of AJAX, this means the request will never actually be sent.

#### diagram

![First](https://raw.githubusercontent.com/kasvtv/micro-observers/master/diagrams/first.svg?sanitize=true)

#### arguments
- **fn** *(function)*: Your async function

#### returns
- **safeFn** *(function)*: Your restricted, observable async function.
  - **subscribe** *(function(Object))*: Accepts an object containing a `success`, `error`, and/or `supersede` callback.      
    **returns:**
    - **unsubscribe** *(function)*: Unsubscribe all callbacks from the previous `subscribe` call

#### example
```js
import first from 'micro-observers/first';
import { refresh, showResults, showError } from '******';

const firstRefresh = first(refresh);

firstRefresh.subscribe({
	success: showResults,
	error: showError,
});

firstRefresh();

// Prevent refresh from being fired again before the previoius refresh has finished
```

<br/>
<br/>

### function **last**(fn) -> safeFn

Restricts an async function by only invoking its success or error handlers if the function wasn't called in the meantime. In case of AJAX, the request will always be made, just not handled in the frontend if it has been superseded by another request before arriving.

#### diagram

![Last](https://raw.githubusercontent.com/kasvtv/micro-observers/master/diagrams/last.svg?sanitize=true)

#### arguments
- **fn** *(function)*: Your async function

#### returns
- **safeFn** *(function)*: Your restricted, observable async function.
  - **subscribe** *(function(Object))*: Accepts an object containing a `success`, `error`, and/or `supersede` callback.      
    **returns:**
    - **unsubscribe** *(function)*: Unsubscribe all callbacks from the previous `subscribe` call

#### example
```js
import last from 'micro-observers/last';
import { refresh, showResults, showError } from '******';

const lastRefresh = last(refresh);

lastRefresh.subscribe({
	success: showResults,
	error: showError,
});

lastRefresh();

// Only resolve the latest refreshed results
```

<br/>
<br/>

### function **distinct**(fn, depth) -> safeFn

Restricts an async function by only invoking it when arguments are different than its last call. In case of AJAX, this means any request with new arguments will be made, but if another request with new arguments is made in the meantime, it will never be handled in the frontend.

#### diagram

![Distinct](https://raw.githubusercontent.com/kasvtv/micro-observers/master/diagrams/distinct.svg?sanitize=true)

#### arguments
- **fn** *(function)*: Your async function
- **depth** *(number) (optional)*: How many levels deep to check for equality. Default is 0, meaning shallow equality.

#### returns
- **safeFn** *(function)*: Your restricted, observable async function.
  - **subscribe** *(function(Object))*: Accepts an object containing a `success`, `error`, and/or `supersede` callback.      
    **returns:**
    - **unsubscribe** *(function)*: Unsubscribe all callbacks from the previous `subscribe` call

#### example
```js
import distinct from 'micro-observers/distinct';
import { login, startSession, showLoginError } from '******';

const safeLogin = distinct(fetchUser);

lastRefresh.subscribe({
	success: startSession,
	error: showLoginError,
});

safeLogin(username, password)

// A login request that's still in progress can now only be refired if it has new credentials and will supersede the previous request
```

<br/>
<br/>

### function **deeplyDistinct**(fn) -> safeFn

Alias for distinct(fn, 1)

<br/>
<br/>

## FAQ

- *What happens if a function from *first* or *distinct* is supressed? Will my app crash if I curry or call then/catch/finally on the result?*  
Your app won't crash. When the call is supressed, a dummy thenable is returned with then/catch/finally functions that don't actually do anything. This value can be imported (for equality checking) from `'micro-observers/utils/stub'`

- *What about partially applied functions like with redux thunks?*  
Functions that immediately return other functions are supported.

- *What about functions that only sometimes return a Promise?*  
All return values are always wrapped in a Promise.

- *What if an error occurs in my transformed function?*  
Then a rejected Promise holding the error is returned.

- *What if halfway through my async function I decide to cancel it?*  
You can return a cancel token that you can import from `'micro-observers/cancel'`.

<br/>
<br/>

## More examples

### Redux thunks
```js
import distinct from 'micro-observers/distinct';
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
);

safeLoginThunk.subscribe({
	success: ({dispatch, token}) => dispatch(userSuccess(token)),
	error: ({dispatch, error}) => dispatch(userFailure(error)),
});

```

### Cancellation token
```js
import last from 'micro-observers/last';
import cancel from 'micro-observers/cancel';
import { refresh, showResults, showError } from '******';

const lastRefresh = last(
	async (currentData) => {
		const data = await refresh();
		if (currentData.equals(data)) return cancel;

		return data;
	}
);

lastRefresh.subscribe({
	success: showResults,
	error: showError,
});

```

### Cancelling superseded requests with micro-xhr package
```js
/* lastMicroXhr.js */
import last from 'micro-observers/last';

const lastMicroXhr = (fn) => {
	const safeFn = last(fn);
	safeFn.subscribe({ supersede: prom => prom.xhr.abort() })
	return safeFn;
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
	}
);

lastRefresh.subscribe({
	success: showResults,
	error: showError,
});
```
