/*
 * Functional implementation of if/then/else
 * The result of a block's predicate will be in scope for that block.
 *
 * Equivalent to the non-existing pattern:
 *
 * if (const child = element.firstChild) {
 *     // 'child' in scope
 * }
 * else if (const parent = element.parent) {
 *     // 'parent' in scope but not 'child'
 * }
 * else {
 *     // no additional value in scope
 * }
 */


module.exports = getIf;


function getIf(p, then) {
    return {
        elseIf: (p$, then$) => p ? getIf(p, then) : getIf(p$, then$),
        else: dflt => p ? then(p) :
            typeof dflt === `function` ? dflt() : dflt
    };
}


// ------------ demos ------------
/*

const demo0 = getIf(`foo`, s => s.toUpperCase())
    .elseIf(21, n => n * 2)
    .else(`default`);

console.log(demo0);
// "FOO"


const demo1 = getIf(``, s => s.toUpperCase())
    .elseIf(21, n => n * 2)
    .else(`default`);

console.log(demo1);
// 42


const demo2 = getIf(``, s => s.toUpperCase())
    .elseIf(0, n => n * 2)
    .else(() => `default function`);

console.log(demo2);
// "default function"


const demo3 = getIf(``, s => s.toUpperCase())
    .elseIf(0, n => n * 2)
    .else(`default value`);

console.log(demo3);
// "default value"


*/
