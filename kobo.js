//Module.NumberPad
const originalShowEditor_ = ScratchBlocks.FieldNumber.prototype.showEditor_;
ScratchBlocks.FieldNumber.prototype.showEditor_ = function (...args) {
this.useTouchInteraction_ = true;
return originalShowEditor_.apply(this, args);
}
//Module.Pause
var STATUS_RUNNING = 0;
var STATUS_PROMISE_WAIT = 1;
var STATUS_YIELD = 2;
var STATUS_YIELD_TICK = 3;
var STATUS_DONE = 4;

let paused = false;
let pausedThreadState = new WeakMap();
let pauseNewThreads = false;

let steppingThread = null;

const pauseThread = (thread) => {
  if (thread.updateMonitor || pausedThreadState.has(thread)) {
    // Thread is already paused or shouldn't be paused.
    return;
  }

  const pauseState = {
    time: vm.runtime.currentMSecs,
    status: thread.status,
  };
  pausedThreadState.set(thread, pauseState);
  thread.status = STATUS_PROMISE_WAIT;
};
const ensurePausedThreadIsStillPaused = (thread) => {
  if (thread.status === STATUS_DONE) {
    // If a paused thread is finished by single stepping, let it keep being done.
    return;
  }
  const pauseState = pausedThreadState.get(thread);
  if (pauseState) {
    if (thread.status !== STATUS_PROMISE_WAIT) {
      // We'll record the change so we can properly resume the thread, but the thread must still be paused for now.
      pauseState.status = thread.status;
      thread.status = STATUS_PROMISE_WAIT;
    }
  }
};
const setSteppingThread = (thread) => {
  steppingThread = thread;
};

