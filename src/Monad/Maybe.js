module.exports = {
    Maybe
};


const Nothing = {};


function Maybe(value) {
    return Object.freeze({
        map: f => isNothing(value)
            ? Maybe(Nothing)
            : Maybe(f(value)),
        fromMaybe: defVal => isNothing(value)
            ? defVal
            : value
    });
}


function isNothing(val) {
    return val === undefined
        || val === Nothing
        || val === null
        || typeof val === `number` && isNaN(val);
}
