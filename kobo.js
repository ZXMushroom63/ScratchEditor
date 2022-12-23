//NumberPad Module
const originalMouseDown = ScratchBlocks.FieldNumber.prototype.showEditor_;
ScratchBlocks.FieldNumber.prototype.showEditor_ = function (...args) {
this.useTouchInteraction_ = true;
return originalMouseDown.apple(this, args);
}
//Smthing else