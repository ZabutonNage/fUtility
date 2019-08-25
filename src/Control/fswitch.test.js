const jsc = require(`jscheck`)();
const fswitch = require(`./fswitch`);
const { eq } = require(`../../testUtils`);


jsc.claim(
    `literal cases, literal otherwise`,
    (verdict, str) => {
        const fn = () => {};

        return verdict(
            (str === `fo` ? fn : str.toUpperCase()) === fswitch(str)
                .case(eq(`fo`), fn)
                .case(eq(`of`), `OF`)
                .case(eq(`ff`), `FF`)
                .otherwise(`OO`)
        );
    },
    [jsc.string(2, jsc.character(`fo`))],
    (str) => str
);

jsc.claim(
    `literal cases, functional otherwise`,
    (verdict, str) => {
        const fn = () => {};

        return verdict(
            (str === `fo` ? fn : str.toUpperCase()) === fswitch(str)
                .case(eq(`fo`), fn)
                .case(eq(`of`), `OF`)
                .case(eq(`ff`), `FF`)
                .otherwise_(str$ => str$.toUpperCase())
        );
    },
    [jsc.string(2, jsc.character(`fo`))],
    (str) => str
);

jsc.claim(
    `functional cases, literal otherwise`,
    (verdict, str) => verdict(
        str.toUpperCase() === fswitch(str)
            .case_(eq(`fo`), _ => `FO`)
            .case_(eq(`of`), str$ => str$.toUpperCase())
            .case_(eq(`ff`), toUpper)
            .otherwise(`OO`)
    ),
    [jsc.string(2, jsc.character(`fo`))],
    (str) => str
);

jsc.claim(
    `functional cases, functional otherwise`,
    (verdict, str) => verdict(
        str.toUpperCase() === fswitch(str)
            .case_(eq(`fo`), toUpper)
            .case_(eq(`of`), toUpper)
            .case_(eq(`ff`), toUpper)
            .otherwise_(toUpper)
    ),
    [jsc.string(2, jsc.character(`fo`))],
    (str) => str
);

jsc.claim(
    `mixed literal and functional cases, literal otherwise`,
    (verdict, str) => verdict(
        str.toUpperCase() === fswitch(str)
            .case_(eq(`fo`), toUpper)
            .case(eq(`of`), `OF`)
            .case_(eq(`ff`), toUpper)
            .otherwise(`OO`)
    ),
    [jsc.string(2, jsc.character(`fo`))],
    (str) => str
);

jsc.claim(
    `mixed literal and functional cases, functional otherwise`,
    (verdict, str) => verdict(
        str.toUpperCase() === fswitch(str)
            .case(eq(`fo`), `FO`)
            .case_(eq(`of`), toUpper)
            .case(eq(`ff`), `FF`)
            .otherwise_(toUpper)
    ),
    [jsc.string(2, jsc.character(`fo`))],
    (str) => str
);



jsc.check({
    nr_trials: 1000,
    detail: 3,
    on_report: console.log,
    on_result: obj => console.log(`on_result:`, obj)
});



function toUpper(str) {
    return str.toUpperCase();
}
