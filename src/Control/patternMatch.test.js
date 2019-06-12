const jsc = require(`jscheck`)();
const { patternMatch, _, __ } = require(`./patternMatch`);

const tests = require(`../../testUtils/fnQueue`)();
const { queue, only, pick, skip } = tests;


queue(() => {
    jsc.claim(
        `global mode`,
        verdict => {
            const pm = patternMatch([]);
            verdict(
                !!pm
                && typeof pm === `object`
                && Object.keys(pm).length === 2
                && pm.hasOwnProperty(`pattern`)
                && pm.hasOwnProperty(`otherwise`)
            );
        }
    );
});

queue(() => {
    jsc.claim(
        `scoped mode`,
        verdict => verdict(
            `foo` === patternMatch([], pm => pm
                .otherwise(() => `foo`)
            )
        )
    );
});

queue(() => {
    jsc.claim(
        `invalid scoped callback throws`,
        (verdict, a) => {
            try {
                patternMatch([], a);
                verdict(a === undefined || typeof a === `function`);
            }
            catch (ex) {
                verdict(ex.message === `Parameter 'scoped' must be a function.`);
            }
        },
        [jsc.wun_of([jsc.any(), jsc.literal(() => {})], [99, 1])]
    );
});

queue(() => {
    jsc.claim(
        `no empty pattern`,
        (verdict) => {
            try {
                verdict(
                    patternMatch([])
                        .pattern()(never)
                        .otherwise(never)
                );
            }
            catch (ex) {
                verdict(ex.message === `No empty pattern allowed.`);
            }
        }
    );
});

queue(() => {
    jsc.claim(
        `match number of pattern args`,
        (verdict, a, b) => {
            try {
                verdict(
                    patternMatch([a, b])
                        .pattern(1, 2)(always)
                        .pattern(0)(never)
                        .otherwise(never)
                );
            }
            catch (ex) {
                verdict(ex.message === `Number of pattern arguments must equal the number of arguments to match.`);
            }
        },
        [jsc.integer(0, 2), jsc.integer(1, 2)]
    );
});

queue(() => {
    jsc.claim(
        `single arg: zero, one or otherwise`,
        (verdict, val) => verdict(
            patternMatch([val])
                .pattern(0)(() => `zero`)
                .pattern(1)(() => `one`)
                .otherwise(() => `otherwise`) === (val === 0 ? `zero` : val === 1 ? `one` : `otherwise`)
        ),
        [jsc.wun_of([-1, 0, 1, `0`, jsc.falsy()])],
        // val => (val === 0 ? `zero` : val === 1 ? `one` : reject(.25, `otherwise`))
    );
});

queue(() => {
    jsc.claim(
        `two args: int and string`,
        (verdict, arr) => verdict(
            crossCheck(arr) === patternMatch(arr)
                .pattern(0, `foo`)(() => `0 foo`)
                .pattern(`bar`, 1)(() => `bar 1`)
                .otherwise(() => `otherwise`)
        ),
        [jsc.array([
            jsc.wun_of([0, jsc.integer(), `bar`, jsc.string()]),
            jsc.wun_of([1, jsc.integer(), `foo`, jsc.string()])
        ])],
        arr => {
            const cc = crossCheck(arr);
            return cc === `otherwise` && Math.random() < .9
                ? undefined
                : cc;
        }
    );

    function crossCheck(arr) {
        return arr[0] === 0 && arr[1] === `foo`
            ? `0 foo`
            : arr[0] === `bar` && arr[1] === 1
                ? `bar 1`
                : `otherwise`;
    }
});

queue(() => {
    jsc.claim(
        `factorial`,
        (verdict, n) => verdict(fac(n) === crossCheck(n)),
        [jsc.sequence([0, 1, 2, 3, 4, 5, 6])]
    );

    function fac(n) {
        return patternMatch(arguments)
            .pattern(0)(() => 1)
            .otherwise(() => n * fac(n - 1));
    }
    function crossCheck(n) {
        switch (n) {
            case 0: return 1;
            case 1: return 1;
            case 2: return 2;
            case 3: return 6;
            case 4: return 24;
            case 5: return 120;
            case 6: return 720;
            default: throw Error(`crossCheck not defined for factorial ${n}`);
        }
    }
});

queue(() => {
    jsc.claim(
        `arguments being passed to pattern handler`,
        (verdict, a, b) => verdict(
            crossCheck(a, b) === patternMatch([a, b])
                .pattern(1, `a`)((a$, b$) => JSON.stringify([a$, b$]))
                .otherwise((a$, b$) => JSON.stringify([b$, a$]))
        ),
        [jsc.integer(1, 2), jsc.character(`a`, `b`)]
    );

    function crossCheck(a, b) {
        return a === 1 && b === `a`
            ? `[1,"a"]`
            : `["${b}",${a}]`;
    }
});

queue(() => {
    jsc.claim(
        `empty array`,
        (verdict, arr) => verdict(
            patternMatch([arr])
                .pattern([])(always)
                .otherwise(never) === (arr.length === 0)
        ),
        [jsc.array(jsc.wun_of([0, 1], [1, 9]), undefined)]
    );
});

queue(() => {
    jsc.claim(
        `flat arrays`,
        (verdict, arr) => verdict(
            crossCheck(arr) === patternMatch([arr])
                .pattern([1])(() => 1)
                .pattern([1, `foo`])(() => 2)
                .otherwise(never)
        ),
        [jsc.array(jsc.integer(0, 3), jsc.wun_of([1, `foo`]))],
        arr => arr.length === 1 ? `len 1` : arr.length === 2 ? `len 2` : reject(.75, `otherwise`)
    );

    function crossCheck(arr) {
        // TODO replace magic numbers with more meaningful strings
        const strArr = JSON.stringify(arr);
        return strArr === `[1]`
            ? 1
            : strArr === `[1,"foo"]`
                ? 2
                : false;
    }
});

queue(() => {
    jsc.claim(
        `nested arrays`,
        (verdict, [arr]) => verdict(
            crossCheck(arr) === patternMatch([0, arr])
                .pattern(0, [1])(() => `depth 1`)
                .pattern(0, [1, [2]])(() => `depth 2`)
                .pattern(0, [1, [2, [3]]])(() => `depth 3`)
                .otherwise(never)
        ),
        [arrGen(jsc.integer(1, 4))],
        // ([arr, depth]) => depth.toString()
    );

    function crossCheck(arr) {
        const strArr = JSON.stringify(arr);

        if (strArr === `[1]`) return `depth 1`;
        if (strArr === `[1,[2]]`) return `depth 2`;
        if (strArr === `[1,[2,[3]]]`) return `depth 3`;

        return false;
    }
    function arrGen(depth) {
        return () => {
            const depth$ = depth();

            return [arrGen$(1), depth$];

            function arrGen$(depth) {
                return depth === depth$
                    ? [depth$]
                    : [depth, arrGen$(depth + 1)];
            }
        };
    }
});

queue(() => {
    jsc.claim(
        `flat objects`,
        (verdict, obj) => verdict(
            crossCheck(obj) === patternMatch([obj])
                .pattern({ foo: `bar` })(() => `foo bar`)
                .pattern({ foo: undefined })(() => `foo undefined`)
                .pattern({})(() => `no keys`)
                .otherwise(() => `otherwise`)
        ),
        [jsc.object(
            jsc.array(jsc.integer(0, 2), jsc.wun_of([`foo`, `bar`])),
            jsc.wun_of([`foo`, `bar`, jsc.falsy()])
        )],
        // obj => `${crossCheck(obj)} (${Object.keys(obj).length} keys)`
    );

    function crossCheck(obj) {
        const keyCount = Object.keys(obj).length;

        if (keyCount === 0) return `no keys`;
        if (keyCount === 1 && obj.foo === `bar`) return `foo bar`;
        if (keyCount === 1 && obj.hasOwnProperty(`foo`) && obj.foo === undefined) return `foo undefined`;

        return `otherwise`;
    }
});

queue(() => {
    jsc.claim(
        `nested objects`,
        (verdict, obj) => verdict(
            crossCheck(obj) === patternMatch([obj])
                .pattern({ foo: 0 })(() => `foo 0`)
                .pattern({ foo: {} })(() => `foo empty obj`)
                .pattern({ foo: [] })(() => `foo empty array`)
                .pattern({ foo: { bar: `bar` } })(() => `foo bar bar`)
                .pattern({ foo: { bar: {} } })(() => `foo bar empty obj`)
                .pattern({ foo: { bar: [] } })(() => `foo bar empty array`)
                .pattern({ foo: { bar: { baz: undefined } } })(() => `foo bar baz undefined`)
                .otherwise(() => `otherwise`)
        ),
        [
            jsc.object({
                foo: jsc.wun_of([
                    0,
                    {},
                    [],
                    jsc.object({ bar: jsc.wun_of([`bar`, undefined]) }),
                    { bar: {} },
                    { bar: [] },
                    jsc.object({ bar: jsc.object({ baz: jsc.wun_of([`baz`, undefined]) }) })
                ], [
                    1, 1, 1, 2, 1, 1, 2
                ])
            })
        ],
        // crossCheck
    );

    function crossCheck(obj) {
        if (obj.foo === 0) return `foo 0`;
        if (JSON.stringify(obj.foo) === `{}` && Object.keys(obj.foo).length === 0) return `foo empty obj`;
        if (JSON.stringify(obj.foo) === `[]`) return `foo empty array`;
        if (obj.foo.bar === `bar`) return `foo bar bar`;
        if (JSON.stringify(obj.foo.bar) === `{}` && Object.keys(obj.foo.bar).length === 0) return `foo bar empty obj`;
        if (JSON.stringify(obj.foo.bar) === `[]`) return `foo bar empty array`;
        if (obj.foo.bar && obj.foo.bar.hasOwnProperty(`baz`) && obj.foo.bar.baz === undefined) return `foo bar baz undefined`;

        return `otherwise`;
    }
});

queue(() => {
    jsc.claim(
        `wildcards: scoped and global identical`,
        verdict => verdict(
            patternMatch([], (pm, _$, __$) => pm
                .otherwise(() => _ === _$ && __ === __$)
            )
        )
    );
});

queue(() => {
    jsc.claim(
        `wildcards: top-level, single`,
        (verdict, a, b) => verdict(
            patternMatch([a, b])
                .pattern(1, _)((a$, b$) => a$ === 1)
                .pattern(_, 2)((a$, b$) => a$ !== 1 && b$ === 2)
                .pattern(_, _)((a$, b$) => a$ !== 1 && b$ !== 2)
                .otherwise(never)
        ),
        [
            jsc.wun_of([1, jsc.any()], [1, 9]),
            jsc.wun_of([2, jsc.any()], [1, 9])
        ]
    );
});

queue(() => {
    jsc.claim(
        `wildcards: top-level, 'rest' not allowed`,
        (verdict, a) => {
            try {
                verdict(
                    patternMatch([a])
                        .pattern(0)(always)
                        .pattern(__)(never)
                        .otherwise(never)
                );
            } catch (ex) {
                verdict(ex.message === `'rest' wildcard is not allowed in top-level pattern.`);
            }
        },
        [jsc.wun_of([0, jsc.any()], [1, 9])]
    );
});

queue(() => {
    jsc.claim(
        `wildcards: array, single`,
        (verdict, arr) => verdict(
            patternMatch([arr])
                .pattern([1, _])(([a, b]) => a === 1)
                .pattern([_, 2])(([a, b]) => a !== 1 && b === 2)
                .pattern([_, _])(([a, b]) => a !== 1 && b !== 2)
                .otherwise(arr$ => arr$.length !== 2)
        ),
        [
            jsc.array(jsc.wun_of([0, 1, 2, 3], [1, 1, 12, 1]), jsc.integer(1, 2))
        ],
        // arr => arr.length === 2 ? `${arr.length} elements, [${arr[0]}, ${arr[1]}]` : `${arr.length} elements`
    );
});

queue(() => {
    jsc.claim(
        `wildcards: array, 'rest' valid`,
        (verdict, arr) => verdict(
            patternMatch([arr])
                .pattern([1, 2, __])(([a, b]) => a === 1 && b === 2)
                .pattern([1, 2, 1])(never)
                .pattern([1, 2])(never)
                .pattern([1, __])(([a, b]) => a === 1 && b !== 2)
                .pattern([__])(([a]) => a !== 1)
                .otherwise(never)
        ),
        [
            jsc.array(
                jsc.wun_of([0, 1, 2, 3, 4], [1, 4, 4, 1, 1]),
                jsc.wun_of([1, 2], [2, 1])
            )
        ],
        // arr => JSON.stringify(arr)
    );
});

queue(() => {
    jsc.claim(
        `wildcards: array, 'rest' invalid (not last)`,
        (verdict, arr) => {
            try {
                verdict(
                    patternMatch([arr])
                        .pattern([_])(always)
                        .pattern([1, __, 1])(never)
                        .otherwise(never)
                );
            } catch (ex) {
                verdict(ex.message === `'rest' wildcard must be the last element in array pattern.`);
            }
        },
        [jsc.array()]
    );
});

queue(() => {
    jsc.claim(
        `wildcards: array, 'rest' invalid (multiple)`,
        (verdict, arr) => {
            try {
                verdict(
                    patternMatch([arr])
                        .pattern([_])(always)
                        .pattern([1, __, __])(never)
                        .otherwise(never)
                );
            } catch (ex) {
                verdict(ex.message === `Only one 'rest' wildcard allowed in array pattern.`);
            }
        },
        [jsc.array()]
    );
});

queue(() => {
    jsc.claim(
        `wildcards: object, single`,
        (verdict, obj) => verdict(
            crossCheck(obj) === patternMatch([obj])
                .pattern({ foo: `foo` })(() => `foo foo`)
                .pattern({ foo: _ })(() => `foo any`)
                .pattern({ _ })(() => `not foo`)
                .otherwise(() => `not single key`)
        ),
        [
            jsc.object(
                jsc.array(jsc.wun_of([1, 2, 0], [70, 25, 5]), jsc.wun_of([`foo`, jsc.any()])),
                jsc.wun_of([`foo`, jsc.any()], [1, 9])
            )
        ],
        // crossCheck
    );

    function crossCheck(obj) {
        if (Object.keys(obj).length !== 1) return `not single key`;
        if (!obj.hasOwnProperty(`foo`)) return `not foo`;
        if (obj.foo === `foo`) return `foo foo`;
        return `foo any`;
    }
});

queue(() => {
    jsc.claim(
        `wildcards: object, single key, multiple values`,
        (verdict, obj) => verdict(
            crossCheck(obj) === patternMatch([obj])
                .pattern({ foo: _, bar: _ })(() => `foo bar`)
                .pattern({ foo: `foo`, bar: _ })(unreachable)
                .pattern({ _, bar: _ })(() => `any bar`)
                .pattern({ foo: _, _ })(() => `foo any`)
                .otherwise(() => `otherwise`)
        ),
        [
            jsc.wun_of([
                jsc.object({ foo: jsc.wun_of([`foo`, jsc.any()], [2, 8]), bar: jsc.any() }),
                jsc.object(jsc.array(2, jsc.wun_of([`foo`, `bar`, jsc.any()], [1, 1, 2])), jsc.wun_of([`foo`, jsc.any()])),
                jsc.object(jsc.wun_of([1, 3], [1, 4]))
            ], [
                1, 5, 1
            ])
        ],
        // obj => `${crossCheck(obj)} (${Object.keys(obj).length} keys)`
    );

    function crossCheck(obj) {
        if (Object.keys(obj).length !== 2) return `otherwise`;

        if (obj.hasOwnProperty(`foo`) && obj.hasOwnProperty(`bar`)) return `foo bar`;
        if (!obj.hasOwnProperty(`foo`) && obj.hasOwnProperty(`bar`)) return `any bar`;
        if (obj.hasOwnProperty(`foo`) && !obj.hasOwnProperty(`bar`)) return `foo any`;

        return `otherwise`;
    }
});

queue(() => {
    jsc.claim(
        `wildcards: object, rest`,
        (verdict, obj) => verdict(
            crossCheck(obj) === patternMatch([obj])
                .pattern({ foo: _, __ })(() => `foo any rest`)
                // TODO investigate if it's feasible to enforce 'rest' to be in last position
                .pattern({ __, bar: _ })(() => `bar any rest`)
                .pattern({ __ })(() => `rest`)
                .pattern({ _ })(unreachable)
                .otherwise(unreachable)
        ),
        [
            jsc.wun_of([
                jsc.object(jsc.array(jsc.integer(1, 3), jsc.wun_of([`foo`, jsc.any(), `bar`], [10, 20, 5])), jsc.any()),
                jsc.object(jsc.array(jsc.integer(1, 3), jsc.wun_of([`bar`, jsc.any(), `foo`], [10, 20, 5])), jsc.any()),
                {}
            ], [
                8, 8, 1
            ])
        ],
        // obj => `${crossCheck(obj)} (${Object.keys(obj).length} keys)`
    );

    function crossCheck(obj) {
        if (obj.hasOwnProperty(`foo`)) return `foo any rest`;
        if (obj.hasOwnProperty(`bar`)) return `bar any rest`;

        return `rest`;
    }
});

queue(() => {
    jsc.claim(
        `additional wildcards (scoped): 3 additionals max`,
        verdict => verdict(
            patternMatch([], (pm, _, __, _1, _2, _3, _4) => pm
                .otherwise(() => _4 === undefined && [_, __, _1, _2, _3].every(wild => wild !== undefined))
            )
        )
    );
});

// single wildcard must be named _
// { _ }                -> key and value IGNORED
// { foo: _ }           -> key matched, value IGNORED
// { _1 }               -> key and value IGNORED
// alias = _1 { alias } -> key and value IGNORED
// ergo { alias: _1 }   -> key and value IGNORED
// if
// alias = _ { alias }  -> key and value IGNORED
// then { alias: _ }    -> key and value IGNORED
// mismatch to
// { foo: _ }           -> key matched, value IGNORED
queue(() => {
    jsc.claim(
        `additional wildcards (scoped): object, key/value roles`,
        (verdict, obj) => verdict(
            crossCheck(obj) === patternMatch([obj], (pm, _, __, _1, _2, _3) => pm
                .pattern({ _1 })(
                    () => `any single key object`)
                .pattern({ _2 })(
                    () => `any single key object (unreachable)`)
                .pattern({ foo: _, bar: _2 })(
                    () => `foo + aliased additional`)
                .pattern({ _, _3 })(
                    () => `any two key object`)
                .otherwise(
                    () => `empty or three-keyed object`)
            )
        ),
        [jsc.object(
            jsc.array(
                jsc.wun_of(
                    [0, 3, jsc.wun_of([1, 2, 2])],
                    [1, 1, 40]),
                jsc.wun_of([`foo`, jsc.any()], [1, 3])
            ),
            jsc.any()
        )],
        // crossCheck
    );

    function crossCheck(obj) {
        switch (Object.keys(obj).length) {
            case 0:
            case 3: return `empty or three-keyed object`;
            case 1: return `any single key object`;
            case 2: return obj.hasOwnProperty(`foo`)
                ? `foo + aliased additional`
                : `any two key object`;
            default: throw Error(`crossCheck not defined for ${JSON.stringify(obj)}`);
        }
    }
});

queue(() => {
    jsc.claim(
        `additional wildcards (scoped): object, multiple keys`,
        (verdict, obj) => verdict(
            patternMatch([obj], (pm, _, __, _1, _2, _3) => pm
                .pattern({ _1 })(
                    obj$ => Object.keys(obj$).length === 1)
                .pattern({ _, _1 })(
                    obj$ => Object.keys(obj$).length === 2)
                .pattern({ _1, _2, _3 })(
                    obj$ => Object.keys(obj$).length === 3)
                .pattern({ _, _1, _2, _3 })(
                    obj$ => Object.keys(obj$).length === 4)
                .otherwise(
                    obj$ => Object.keys(obj$).length === 0 || Object.keys(obj$).length === 5)
            )
        ),
        [jsc.object(jsc.wun_of([0, 5, 1, 2, 3, 4], [1, 1, 10, 10, 10, 10]))],
        // obj => `object's key count: ${Object.keys(obj).length}`
    );
});

/*
TODO define behaviour
 throwing might be best

pick(() => {
    jsc.claim(
        `additional wildcards (scoped): array`,
        (verdict) => verdict(
            false
        )
    );
});

pick(() => {
    jsc.claim(
        `additional wildcards (scoped): top-level`,
        (verdict) => verdict(
            false
        )
    );
});
*/

queue(() => {
    jsc.claim(
        `guards: top-level wildcarded values passed to guard`,
        (verdict, a, b) => verdict(
            crossCheck(a, b) === patternMatch([a, b], (pm, _) => pm
                .pattern(1, 1).if((a$, b$) => a$ === undefined && b$ === undefined)(() => `1. no wildcards`)
                .pattern(_, 1).if((a$, unused) => a$ === a && unused === undefined)(() => `2. left wildcard`)
                .pattern(1, _).if((b$, unused) => b$ === b && unused === undefined)(() => `3. right wildcard`)
                .pattern(_, _).if((a$, b$) => a$ === a && b$ === b)(() => `4. both wildcards`)
                .pattern(_, _)(unreachable)
                .otherwise(unreachable)
            )
        ),
        [
            jsc.wun_of([1, jsc.any()]),
            jsc.wun_of([1, jsc.any()]),
        ],
        (a, b) => Number.isNaN(a) || Number.isNaN(b) ? undefined : ``
    );

    function crossCheck(a, b) {
        if (a === 1 && b === 1) return `1. no wildcards`;
        if (b === 1) return `2. left wildcard`;
        if (a === 1) return `3. right wildcard`;
        return `4. both wildcards`;
    }
});

queue(() => {
    jsc.claim(
        `guards: fall-through`,
        (verdict, a) => verdict(
            crossCheck(a) === patternMatch([a], (pm, _) => pm
                .pattern(_)
                    .if(gt(4))(() => `1. gt 4`)
                    .if(gt(3))(() => `2. gt 3`)
                .pattern(3)(() => `3. three`)
                .pattern(_)
                    .if(gt(1))(() => `4. gt 1`)
                .otherwise(() => `5. otherwise`)
            )
        ),
        [
            jsc.wun_of([jsc.integer(5), jsc.any()], [12, 1])
        ]
    );

    function gt(y) {
        return x => x > y;
    }
    function crossCheck(a) {
        if (a > 4) return `1. gt 4`;
        if (a > 3) return `2. gt 3`;
        if (a === 3) return `3. three`;
        if (a > 1) return `4. gt 1`;
        return `5. otherwise`;
    }
});


tests.run(() => jsc.check({
    nr_trials: 10000,
    detail: 3,
    on_report: console.log,
    on_result: obj => console.log(`on_result:`, obj)
}));



function reject(rate, classifier) {
    return Math.random() < rate
        ? undefined
        : classifier;
}

function always() {
    return true;
}
function never() {
    return false;
}
function unreachable() {
    return `unreachable`;
}
