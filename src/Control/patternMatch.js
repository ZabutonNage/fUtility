const _ = {};
const __ = {};
const _addl = {};


module.exports = {
    patternMatch,
    _,
    __
};


// TODO key wildcard, match on value
// TODO consider accepting pattern handlers as the second param to .pattern.
//  an extra comma in exchange for fewer parentheses is more pleasant to read and could be a good alternative
//  however, this is not easily possible as .pattern may take any amount of args which are considered part of the pattern
// TODO unlimited amount of additional wildcards

function patternMatch(args, scoped) {
    if (scoped !== undefined && typeof scoped !== `function`) throw Error(`Parameter 'scoped' must be a function.`);

    const inputArgs = Array.from(args);
    const unmatched = {};

    const pm = Object.freeze({
        pattern: pattern$(unmatched)
    });

    return typeof scoped === `function`
        ? scoped(pm, _, __, _addl, _addl, _addl)
        : pm;


    function pattern$(val) {
        return (...patternArgs) => {
            if (patternArgs.length === 0) throw Error(`No empty pattern allowed.`);
            if (patternArgs.length !== inputArgs.length) throw Error(`Number of pattern arguments must equal the number of arguments to match.`);
            if (patternArgs.indexOf(__) !== -1) throw Error(`'rest' wildcard is not allowed in top-level pattern.`);

            const matched = val === unmatched && arrEqDeep(patternArgs, inputArgs);
            const wildcardedVals = wildcardedValues(inputArgs, patternArgs);

            const fn = pHandler => {
                const nextVal = matched ? pHandler(...inputArgs) : val;
                return Object.freeze({
                    pattern: pattern$(nextVal),
                    otherwise: otherwise$(nextVal)
                });
            };
            fn.if = if$(val, wildcardedVals, matched);

            return fn;
        };
    }
    function if$(val, wildcardedVals, guardable) {
        return guard => pHandler => {
            const guardPassed = guardable && guard(...wildcardedVals);
            const nextVal = guardPassed
                ? pHandler(...inputArgs)
                : val;
            const nextGuardable = guardPassed
                ? false
                : guardable;

            return Object.freeze({
                pattern: pattern$(nextVal),
                if: if$(nextVal, wildcardedVals, nextGuardable),
                otherwise: otherwise$(nextVal)
            });
        };
    }
    function otherwise$(val) {
        return f => val === unmatched
            ? f(...inputArgs)
            : val;
    }
}


function arrEqDeep(arrPattern, arrVals) {
    const iRest = arrPattern.indexOf(__);

    if (iRest !== arrPattern.lastIndexOf(__)) {
        throw Error(`Only one 'rest' wildcard allowed in array pattern.`);
    }
    if (iRest > -1 && iRest < arrPattern.length -1) {
        throw Error(`'rest' wildcard must be the last element in array pattern.`);
    }

    return iRest === -1
        ? arrPattern.length === arrVals.length && arrPattern.every((x, i) => deepEq(x, arrVals[i]))
        : arrVals.length >= iRest && arrEqDeep(arrPattern.slice(0, iRest), arrVals.slice(0, iRest));
}

function deepEq(x, y) {
    if (x === y) return true;
    if (x === _) return true;
    if (typeof x !== typeof y) return false;
    if (Array.isArray(x) && Array.isArray(y)) return arrEqDeep(x, y);
    if (Array.isArray(x) || Array.isArray(y)) return false;
    if (typeof x === `function`) throw Error(`deepEq not implemented for type function`);
    // TODO watch for typeof symbol and stuff
    if (typeof x !== `object`) return false;

    return objEqDeep(x, y);
}

function objEqDeep(x, y) {
    const keysX = Object.keys(x);
    const keysY = Object.keys(y);

    const regularKeysX = keysX.filter(k => k !== `_` && k !== `__` && x[k] !== _addl);

    if (!regularKeysX.every(k => keysY.includes(k))) return false;

    const hasRest = keysX.indexOf(`__`) > -1;
    const hasAny = keysX.indexOf(`_`) > -1;
    const additionals = Object.values(x).filter(v => v === _addl).length;
    const requiredKeys = regularKeysX.length + (hasAny ? 1 : 0) + additionals;

    if (hasRest && keysY.length < requiredKeys) return false;
    if (!hasRest && keysY.length !== requiredKeys) return false;

    return regularKeysX.every(kx => deepEq(x[kx], y[kx]));
}

function wildcardedValues(inputArgs, patternArgs) {
    return patternArgs
        .map((arg, i) => ({ arg, i }))
        .filter(a => a.arg === _)
        .map(a => inputArgs[a.i]);
}
