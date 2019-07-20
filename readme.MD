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

This library is there to fix these issues forever. It provides you with three higher order functions that transform your asynchronous function to a safer alternative:

## Installation

```bash
npm install async-guards
```

## API

### function **first**(fn) -> safeFn

Transform an asynchronous function such that it can't be called before one of it's previous results resolve or reject. In case of a backend request, this means the request will never actually be sent.

#### diagram

![Size](https://raw.githubusercontent.com/kasvtv/async-guards/master/diagrams/first.svg?sanitize=true)

#### arguments
- **fn** *(function)*: Your async function

#### returns
- **safeFn** *(function)*: Your async function that won't be called if hasn't returned its last result yet.

#### example
```js
import {first} from 'async-guards';
import {refresh} from 'api/wherever';

const safeRefresh = first(refresh);

safeRefresh()
.then(response => {/* handle response */})
.catch(response => {/* handle error */})

// Prevent refresh from being fired again before the previoius refresh has finished

```


### function **last**(fn) -> safeFn

Transform an asynchronous function such that its resulting promise never resolves or rejects when the function has been called again in the meantime. In case of a backend request, this request will still be made, just never handled in the frontend.

#### diagram

![Size](https://raw.githubusercontent.com/kasvtv/async-guards/master/diagrams/last.svg?sanitize=true)

#### arguments
- **fn** *(function)*: Your async function

#### returns
- **safeFn** *(function)*: Your async function that will never resolve or reject if it has been called again in the meantime.

#### example
```js
import {last} from 'async-guards';
import {refresh} from 'api/wherever';

const safeRefresh = last(refresh);

safeRefresh()
.then(response => {/* handle response */})
.catch(response => {/* handle error */})

// Only resolve the latest refreshed results

```

### function **distinct**(fn, depth) -> safeFn

Transform an asynchronous function such that it can't be called before one of it's previous results resolve or reject unless it has new arguments. In case of a backend request, this means any request with new arguments will be made, but never handled in the frontend if another request with new arguments is made in the meantime.

#### diagram

![Size](https://raw.githubusercontent.com/kasvtv/async-guards/master/diagrams/distinct.svg?sanitize=true)

#### arguments
- **fn** *(function)*: Your async function
- **depth** *(number) (optional)*: How deep to check for equality. Default is 0, meaning shallow equality.

#### returns
- **safeFn** *(function)*: Your async function that won't be called if hasn't returned yet, unless it receives new arguments.

#### example
```js
import {distinct} from 'async-guards';
import {login} from 'api/wherever';

const safeLogin = distinct(login);

safeLogin(username, password)
.then(response => {/* handle response */})
.catch(response => {/* handle error */});

// A login request that's still in progress can now only be refired if it has new credentials and will supersede the previous request

```

### function **deeplyDistinct**(fn) -> safeFn

Shortcut for distinct(fn, 1)

## FAQ

- *What happens if a function from *first* or *distinct* is supressed? Will my app crash if I call then/catch/finally on that Promise?*  
No, when the call is supressed, a dummy thenable is returned with then/catch/finally functions that don't actually do anything.

- *What equality algorithm does **distinct** use?*  
**Distinct** uses reference equality for every individual argument. That means that if you pass a single argument as an object, it won't work

- *What about partially applied functions like with redux thunks?*  
Functions that immediately return other functions are supported. Beware though: a partially applied function counts as started as soon as the first function is called and isn't regarded as finished until at some point a resulting function's resulting promise is resolved.

- *What about functions that only sometimes return a Promise?*  
All return values are always wrapped in a Promise.

- *What if an error occurs in my transformed function?*  
Then a rejected Promise holding the error is returned.