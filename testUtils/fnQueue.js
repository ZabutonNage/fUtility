/*  FnQueue

Let's you selectively batch functions.
This is handy for registering tests. During development you might want to run only a subset of tests but commenting the others out is too cumbersome.

queue - Enqueues a function to the regular queue.
only - Stores a function for exclusive execution. All functions queued through the other methods will be ignored.
       Can be called multiple times. However, only the first call is taken into account.
pick - Enqueues a function to the privileged queue. Functions are only called if no other function has been registered with 'only'.
       Functions in the regular queue will be skipped.
skip - Ignores the passed function.
run - Takes a function. Runs all functions in the queue with the highest priority in the order they were enqueued.
      Priorities are: only, pick, queue
      The received function is run AFTER the queued functions.


- Example usage -

const fnq = require(`fnQueue`)();
const { queue, only, pick, skip } = fnq;

queue(() => console.log(`test 1`));
queue(() => console.log(`test 2`));
skip(() => console.log(`never called`));
queue(() => console.log(`test 3`));
only(() => console.log(`only 1`));
pick(() => console.log(`pick 1`));
pick(() => console.log(`pick 2`));
queue(() => console.log(`test 4`));
only(() => console.log(`only 2`));

fnq.run(() => console.log(`runs last`));
*/


module.exports = FnQueue;


function FnQueue() {
    const regular = [];
    const theOnly = [];
    const picked = [];

    return Object.freeze({
        queue: fn => { regular.push(fn); },
        only: fn => { theOnly[0] = theOnly[0] || fn; },
        pick: fn => { picked.push(fn); },
        skip: () => {},
        run: fn => {
            if (theOnly[0]) {
                theOnly[0]();
            }
            else if (picked.length) {
                picked.forEach(f => f());
            }
            else {
                regular.forEach(f => f());
            }

            fn();
        }
    });
}
