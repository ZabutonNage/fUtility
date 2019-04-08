module.exports = fswitch;


function fswitch(value) {
    return fswitch$(false, undefined, false);

    function fswitch$(passed, result, isLiteral) {
        return Object.freeze({
            case: (pred, val) => passed || pred(value) !== true
                ? fswitch$(passed, result, isLiteral)
                : fswitch$(true, val, true),
            case_: (pred, fn) => passed || pred(value) !== true
                ? fswitch$(passed, result, isLiteral)
                : fswitch$(true, fn, false),
            otherwise: val => passed
                ? (isLiteral ? result : result(value))
                : val,
            otherwise_: fn => passed
                ? (isLiteral ? result : result(value))
                : fn(value)
        });
    }
}
