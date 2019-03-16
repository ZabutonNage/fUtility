module.exports = {
    eq,
    notEq,
    add,
    sub,
    mul,
    div,
    pow,
    gt,
    gte,
    lt,
    lte,
    flip
};


function eq(a) {
    return b => a === b;
}

function notEq(a) {
    return b => a !== b;
}

function add(a) {
    return b => a + b;
}

function sub(a) {
    return b => a - b;
}

function mul(a) {
    return b => a * b;
}

function div(a) {
    return b => a / b;
}

function pow(a) {
    return b => a ** b;
}

function gt(a) {
    return b => a > b;
}

function gte(a) {
    return b => a >= b;
}

function lt(a) {
    return b => a < b;
}

function lte(a) {
    return b => a <= b;
}

function flip(f) {
    return a => b => f(b)(a);
}
