const jsc = require(`jscheck`)();
const fswitch = require(`./fswitch`);
const { eq, id } = require(`../../testUtils`);


jsc.claim(
    `literal cases, literal otherwise`,
    (verdict, str) => {
        const fn = () => {};

        return verdict(
            (str === `fo` ? fn : str) === fswitch(str)
                .case(eq(`fo`), fn)
                .case(eq(`of`), `of`)
                .case(eq(`ff`), `ff`)
                .otherwise(`oo`)
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
            (str === `fo` ? fn : str) === fswitch(str)
                .case(eq(`fo`), fn)
                .case(eq(`of`), `of`)
                .case(eq(`ff`), `ff`)
                .otherwise_(() => `oo`)
        );
    },
    [jsc.string(2, jsc.character(`fo`))],
    (str) => str
);

jsc.claim(
    `functional cases, literal otherwise`,
    (verdict, str) => verdict(
        str === fswitch(str)
            .case_(eq(`fo`), id)
            .case_(eq(`of`), () => `of`)
            .case_(eq(`ff`), () => `ff`)
            .otherwise(`oo`)
    ),
    [jsc.string(2, jsc.character(`fo`))],
    (str) => str
);

jsc.claim(
    `functional cases, functional otherwise`,
    (verdict, str) => verdict(
        str === fswitch(str)
            .case_(eq(`fo`), id)
            .case_(eq(`of`), () => `of`)
            .case_(eq(`ff`), () => `ff`)
            .otherwise_(() => `oo`)
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
