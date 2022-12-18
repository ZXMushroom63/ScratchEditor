function getVM() {
  if (!document.querySelector("#app"))
    throw new Error("Unable to access vm through redux");
  window.vm = document
    .querySelector("#app")
    [
      Object.keys(app).find((key) => key.startsWith("__reactContainer"))
    ].child.stateNode.store.getState().scratchGui.vm;
}
