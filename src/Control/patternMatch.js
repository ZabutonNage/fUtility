const _ = {};
const __ = {};


module.exports = {
    patternMatch,
    _,
    __
};


// TODO offer wildcards as module exports and as local params in patternMatch callback
 // multiple key wildcards in objects should be interesting

function patternMatch(args) {
    const inputArgs = Array.from(args);
    const unmatched = {};

    return pm(unmatched);

    function pm(val) {
        return Object.freeze({
            pattern: (...patternArgs) => {
                if (patternArgs.length === 0) throw Error(`No empty pattern allowed.`);
                if (patternArgs.length !== inputArgs.length) throw Error(`Number of pattern arguments must equal the number of arguments to match.`);
                if (patternArgs.indexOf(__) !== -1) throw Error(`'rest' wildcard is not allowed in top-level pattern.`);

                return val === unmatched && arrEqDeep(patternArgs, inputArgs)
                    ? f => pm(f(...inputArgs))
                    : () => pm(val);
            },
            otherwise: f => val === unmatched
                ? f(...inputArgs)
                : val
        });
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
    if (x === _ || y === _) return true;
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

    const regularKeysX = keysX.filter(k => k !== `_` && k !== `__`);

    if (!regularKeysX.every(k => keysY.includes(k))) return false;

    const hasRest = keysX.indexOf(`__`) > -1;
    const hasAny = keysX.indexOf(`_`) > -1;

    if (hasAny) {
        if (hasRest && !(keysY.length > regularKeysX.length)) return false;
        if (!hasRest && keysY.length -1 !== regularKeysX.length) return false;
    }

    if (!hasAny && !hasRest && keysY.length !== regularKeysX.length) return false;

    return regularKeysX.every(kx => deepEq(x[kx], y[kx]));
}
