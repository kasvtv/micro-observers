function Ruleset(args) {
	this.lastArgs = args.lastArgs || { current: [[]] };
	this.calls = args.calls || { current: 0 };
	this.lastCallFinished = args.lastCallFinished || { current: 0 };
	this.callsAtStart = args.callsAtStart || 0;
	this.startCondition = args.startCondition || returnTrue;
	this.endCondition = args.endCondition || returnTrue;
}

Ruleset.prototype.canStart = function(fnArgs) {
	if (this.callsAtStart) { // has been called before
		return this.startCondition(fnArgs);
	}


	if (this.startCondition(fnArgs)) {
		this.callsAtStart = ++this.calls.current;
		this.lastArgs.current = fnArgs;
		return true;
	}
	return false;
};

Ruleset.prototype.canResolve = function(result) {
	done.apply(this, arguments);
	return this.endCondition(result, null);
};

Ruleset.prototype.canReject = function(e) {
	done.apply(this, arguments);
	this.lastArgs.current = [];
	return this.endCondition(null, e);
};

function done() {
	this.lastCallFinished.current = Math.max(
		this.lastCallFinished.current,
		this.callsAtStart
	);
}

function returnTrue() {
	return true;
}

module.exports = Ruleset;