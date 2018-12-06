module.exports = Maybe;


const nothing = {};


function Maybe(value) {
    return Object.freeze({
        map: f => isNothing(value)
            ? Maybe(nothing)
            : Maybe(f(value)),
        fromMaybe: defVal => isNothing(value)
            ? defVal
            : value,
        fromMaybe$: defFn => isNothing(value)
            ? defFn()
            : value
    });
}


function isNothing(val) {
    return val === undefined
        || val === nothing
        || val === null
        || Number.isNaN(val);
}
