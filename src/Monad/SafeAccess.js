module.exports = SafeAccess;


const symId = Symbol();
const invalid = {};


function SafeAccess(obj) {
    if (Object.getOwnPropertySymbols(obj).includes(symId)) return obj;

    const lastProxyable = { value: undefined };
    const handler = {
        // TODO consider blocking "set" etc.
        get: (o, prop) => {
            if (prop === map.name) return map(o, lastProxyable);
            if (prop === fromSafe.name) return fromSafe(o, lastProxyable);

            const nextVal = o[prop];

            if (o === invalid || o === lastProxyable || !defined(nextVal)) {
                return new Proxy(invalid, handler);
            }

            if (typeof nextVal === `object`) {
                return new Proxy(nextVal, handler);
            }

            lastProxyable.value = nextVal;
            return new Proxy(lastProxyable, handler);
        }
    };

    const p = new Proxy(obj, handler);
    p[symId] = 0;

    return p;
}


function map(o, lastProxyable) {
    const Maybe = require(`./Maybe`);

    if (o === invalid) return () => Maybe();

    const val = o === lastProxyable
        ? lastProxyable.value
        : o;

    return f => Maybe(f(val));
}

function fromSafe(o, lastProxyable) {
    return val => o === invalid
        ? val
        : o === lastProxyable
            ? lastProxyable.value
            : o;
}


function defined(a) {
    return a !== undefined && a !== null && !Number.isNaN(a);
}
