const jsc = require(`jscheck`)();

const { eq, notEq, add, sub, mul, div, pow, gt, gte, lt, lte, flip } = require(`./index`);


jsc.claim(`eq`,
    (verdict, a, b) => verdict(
        (a === b) === eq(a)(b) &&
        (a === b) === eq(b)(a)
    ),
    [
        jsc.any(),
        jsc.any()
    ]
);

jsc.claim(`notEq`,
    (verdict, a, b) => verdict(
        (a !== b) === notEq(a)(b) &&
        (a !== b) === notEq(b)(a)
    ),
    [
        jsc.any(),
        jsc.any()
    ]
);

jsc.claim(`add (numerical)`,
    (verdict, a, b) => verdict(
        a + b === add(a)(b) &&
        a + b === add(b)(a)
    ),
    [
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)]),
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)])
    ]
);

jsc.claim(`add (strings)`,
    (verdict, a, b) => verdict(
        a + b === add(a)(b) &&
        (a + b !== add(b)(a) || a === b || a === `` || b === ``)
    ),
    [
        jsc.string(jsc.integer(0, 8), jsc.character()),
        jsc.string(jsc.integer(0, 8), jsc.character())
    ]
);

jsc.claim(`sub`,
    (verdict, a, b) => verdict(
        a - b === sub(a)(b) &&
        (a - b !== sub(b)(a) || a === b)
    ),
    [
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)]),
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)])
    ]
);

jsc.claim(`mul`,
    (verdict, a, b) => verdict(
        a * b === mul(a)(b) &&
        a * b === mul(b)(a)
    ),
    [
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)]),
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)])
    ]
);

jsc.claim(`div`,
    (verdict, a, b) => verdict(
        a / b === div(a)(b)
        && (a / b !== div(b)(a) || Math.abs(a) === Math.abs(b))
        || Number.isNaN(a / b) && Number.isNaN(div(a)(b))
    ),
    [
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)]),
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)])
    ]
);

jsc.claim(`pow`,
    (verdict, a, b) => verdict(
        a ** b === pow(a)(b) ||
        Number.isNaN(a ** b) && Number.isNaN(pow(a)(b))
    ),
    [
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)]),
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)])
    ]
);

jsc.claim(`gt (numerical)`,
    (verdict, a, b) => verdict(
        a > b === gt(a)(b) &&
        (a > b !== gt(b)(a) || a === b)
    ),
    [
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)]),
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)])
    ]
);

jsc.claim(`gt (strings)`,
    (verdict, a, b) => verdict(
        a > b === gt(a)(b) &&
        (a > b !== gt(b)(a) || a === b)
    ),
    [
        jsc.string(jsc.integer(0, 8), jsc.character()),
        jsc.string(jsc.integer(0, 8), jsc.character())
    ]
);

jsc.claim(`gte (numerical)`,
    (verdict, a, b) => verdict(
        a >= b === gte(a)(b) &&
        (a >= b !== gte(b)(a) || a === b)
    ),
    [
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)]),
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)])
    ]
);

jsc.claim(`gte (strings)`,
    (verdict, a, b) => verdict(
        a >= b === gte(a)(b) &&
        (a >= b !== gte(b)(a) || a === b)
    ),
    [
        jsc.string(jsc.wun_of([0, jsc.integer(5)], [1, 30]), jsc.character()),
        jsc.string(jsc.wun_of([0, jsc.integer(5)], [1, 30]), jsc.character())
    ],
    (a, b) => a === b ? `=== (len ${a.length})` : `!==`
);

jsc.claim(`lt (numerical)`,
    (verdict, a, b) => verdict(
        a < b === lt(a)(b) &&
        (a < b !== lt(b)(a) || a === b)
    ),
    [
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)]),
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)])
    ]
);

jsc.claim(`lt (strings)`,
    (verdict, a, b) => verdict(
        a < b === lt(a)(b) &&
        (a < b !== lt(b)(a) || a === b)
    ),
    [
        jsc.string(jsc.integer(0, 8), jsc.character()),
        jsc.string(jsc.integer(0, 8), jsc.character())
    ]
);

jsc.claim(`lte (numerical)`,
    (verdict, a, b) => verdict(
        a <= b === lte(a)(b) &&
        (a <= b !== lte(b)(a) || a === b)
    ),
    [
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)]),
        jsc.wun_of([jsc.integer(-10, 10), jsc.number(-10, 10)])
    ]
);

jsc.claim(`lte (strings)`,
    (verdict, a, b) => verdict(
        a <= b === lte(a)(b) &&
        (a <= b !== lte(b)(a) || a === b)
    ),
    [
        jsc.string(jsc.wun_of([0, jsc.integer(5)], [1, 30]), jsc.character()),
        jsc.string(jsc.wun_of([0, jsc.integer(5)], [1, 30]), jsc.character())
    ],
    (a, b) => a === b ? `=== (len ${a.length})` : `!==`
);


jsc.claim(`flip`,
    (verdict, a, b) => verdict(
        sub(a)(b) === flip(sub)(b)(a) &&
        (sub(a)(b) !== flip(sub)(a)(b) || a === b)
    ),
    [jsc.integer(-10, 10), jsc.integer(-10, 10)]
);



jsc.check({
    detail: 3,
    nr_trials: 2000,
    on_fail: logCase,
    on_lost: logCase,
    on_report: console.log,
    on_result: obj => console.log(`on_result:`, obj)
});


function logCase({ name, args }) {
    console.log({ name, args });
}
