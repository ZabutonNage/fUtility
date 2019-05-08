module.exports = {
    eq,
    id
};


function eq(a) {
    return b => a === b;
}

function id(x) {
    return x;
}
