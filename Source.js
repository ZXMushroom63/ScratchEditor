window['\x61\x6c\x65\x72\x74']('\x53\x63\x72\x61\x74\x63\x68\x4b\x69\x74\x20\x76\x32\x0a\x4d\x61\x64\x65\x20\x62\x79\x20\x52\x6f\x62\x65\x72\x74\x20\x50\x69\x72\x74\x65\x61\x0a\x67\x69\x74\x68\x75\x62\x2e\x63\x6f\x6d\x2f\x5a\x58\x4d\x75\x73\x68\x72\x6f\x6f\x6d\x36\x33');
if (!location.pathname.includes("editor")) {
  window.alert("ScratchKit 2 must be run in the scratch editor!");
}
function getVM() {
  if (!document.querySelector("#app"))
    throw new Error("Unable to access vm through redux");
  window.vm = document
    .querySelector("#app")
    [
      Object.keys(app).find((key) => key.startsWith("__reactContainer"))
    ].child.stateNode.store.getState().scratchGui.vm;
  console.log("Got VM");
}
function getAppState() {
  if (!document.querySelector("#app"))
    throw new Error("Unable to access vm through redux");
  window.appState = document
    .querySelector("#app")
    [
      Object.keys(app).find((key) => key.startsWith("__reactContainer"))
    ].child.stateNode.store.getState();
  console.log("Got appState");
}
function getInternalKey(elem) {
  var _react_internal_key = Object.keys(elem).find((key) =>
    key.startsWith("__reactInternalInstance$")
  );
  return this._react_internal_key;
}
function _getsoundeditor() {
  var sa = document
    .querySelector('[class*="sound-editor_row-reverse_"] > :nth-child(10)')
    .closest('[class*="sound-editor_editor-container_"]');
  var key = getInternalKey(sa);
  window.SoundEditor = sa[key].return.return.return.stateNode;
  console.log("Got SoundEditor");
}
function getSoundEditor() {
  var hookSoundEditor = () => {
    setTimeout(() => {
      _getsoundeditor();
    }, 10);
  };
  document
    .getElementById("react-tabs-2")
    .addEventListener("click", hookSoundEditor);
}
function getBlockly() {
  window.REACT_INTERNAL_PREFIX =
    "__reactInternalInstance$"; /*/GetScratchBlocksModal Script by ZXMushroom63/*/
  window.BLOCKS_CLASS = '[class^="gui_blocks-wrapper"]';
  window.elem = document.querySelector(BLOCKS_CLASS);
  function getInternalKey(elem) {
    if (!window._react_internal_key) {
      window._react_internal_key = Object.keys(elem).find((key) =>
        key.startsWith(REACT_INTERNAL_PREFIX)
      );
    }
    return window._react_internal_key;
  }
  var internal = elem[getInternalKey(elem)];
  var childable = internal;
  while (
    ((childable = childable.child),
    !childable || !childable.stateNode || !childable.stateNode.ScratchBlocks)
  ) {}
  window.ScratchBlocks = childable.stateNode.ScratchBlocks;
  console.log("Got Blockly");
}
getBlockly();
getVM();
getAppState();
getSoundEditor();

var global_fps = 30;
vm.runtime.start = function () {
  if (this._steppingInterval) return;
  let interval = 1000 / global_fps;
  this.currentStepTime = interval;
  this._steppingInterval = setInterval(() => {
    this._step();
  }, interval);
  this.emit("RUNTIME_STARTED");
};
function setFPS(fps) {
  global_fps = fps;

  clearInterval(vm.runtime._steppingInterval);
  vm.runtime._steppingInterval = null;
  vm.runtime.start();
}
setFPS(30);
function injectScript(url) {
  fetch(url).then((x) => {
    x.blob().then((y) => {
      y.text().then((z) => {
        var script = document.createElement("script");
        script.innerHTML = z;
        document.body.appendChild(script);
      });
    });
  });
}
function modTarget(target) {
  switch (target) {
    case "size":
      vm.editingTarget.size =
        window.prompt(
          "Set size of " + vm.editingTarget.getName(),
          vm.editingTarget.size
        ) * 1;
      vm.emitTargetsUpdate();
      break;
    case "x":
      vm.editingTarget.x =
        window.prompt(
          "Set x pos of " + vm.editingTarget.getName(),
          vm.editingTarget.x
        ) * 1;
      vm.emitTargetsUpdate();
      break;
    case "y":
      vm.editingTarget.y =
        window.prompt(
          "Set y pos of " + vm.editingTarget.getName(),
          vm.editingTarget.y
        ) * 1;
      vm.emitTargetsUpdate();
      break;
    case "removeFencing":
      vm.runtime.renderer._xLeft = Infinity * -1;
      vm.runtime.renderer._xRight = Infinity * 1;
      vm.runtime.renderer._yTop = Infinity * 1;
      vm.runtime.renderer._yBottom = Infinity * -1;
      break;
  }
}

/*/Start custom block script injection/*/
function initForceir() {
  var forceir = document.createElement("div");
  forceir.id = "forceir";
  forceir.setAttribute("title", "Forceir Menu");
  forceir.innerHTML = `
  <details>
    <summary>> Forcer</summary>
    <button onclick="modTarget('size')">Set Size</button>
    <button onclick="modTarget('x')">Set X</button>
    <button onclick="modTarget('y')">Set Y</button>
    <button onclick="modTarget('removeFencing');this.remove();">Remove Fencing</button>
    <button onclick="setFPS(30);">Set FPS to 30 [default]</button>
    <button onclick="setFPS(60);">Set FPS to 60</button>
  </details>
  `;
  document
    .getElementsByClassName("sprite-info_sprite-info_3EyZh box_box_2jjDp")[0]
    .appendChild(forceir);
}

const contextMenuCallbacks = [];
const CONTEXT_MENU_ORDER = [
  "editor-devtools",
  "block-switching",
  "blocks2image",
  "swap-local-global",
];
let createdAnyBlockContextMenus = false;
function createBlockContextMenu(
  callback,
  { workspace = false, blocks = false, flyout = false, comments = false } = {}
) {
  contextMenuCallbacks.push({
    addonId: this._addonId,
    callback,
    workspace,
    blocks,
    flyout,
    comments,
  });

  contextMenuCallbacks.sort(
    (b, a) =>
      CONTEXT_MENU_ORDER.indexOf(b.addonId) -
      CONTEXT_MENU_ORDER.indexOf(a.addonId)
  );

  if (createdAnyBlockContextMenus) return;
  createdAnyBlockContextMenus = true;

  const oldShow = ScratchBlocks.ContextMenu.show;
  ScratchBlocks.ContextMenu.show = function (event, items, rtl) {
    const gesture = ScratchBlocks.mainWorkspace.currentGesture_;
    const block = gesture.targetBlock_;

    for (const {
      callback,
      workspace,
      blocks,
      flyout,
      comments,
    } of contextMenuCallbacks) {
      let injectMenu =
        // Workspace
        (workspace && !block && !gesture.flyout_ && !gesture.startBubble_) ||
        // Block in workspace
        (blocks && block && !gesture.flyout_) ||
        // Block in flyout
        (flyout && gesture.flyout_) ||
        // Comments
        (comments && gesture.startBubble_);
      if (injectMenu) {
        try {
          items = callback(items, block);
        } catch (e) {
          console.error("Error while calling context menu callback: ", e);
        }
      }
    }

    oldShow.call(this, event, items, rtl);

    const blocklyContextMenu = ScratchBlocks.WidgetDiv.DIV.firstChild;
    items.forEach((item, i) => {
      if (i !== 0 && item.separator) {
        const itemElt = blocklyContextMenu.children[i];
        itemElt.style.paddingTop = "2px";
        itemElt.style.borderTop = "1px solid hsla(0, 0%, 0%, 0.15)";
      }
    });
  };
}
const ICON =
  "data:image/svg+xml;base64," +
  btoa(
    `<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 128 128" style="display:inline;enable-background:new" version="1.0" id="svg11300" height="128" width="128"><title id="title4162">Adwaita Icon Template</title><defs id="defs3"><linearGradient id="linearGradient1948"><stop id="stop1944" offset="0" style="stop-color:#2d2839;stop-opacity:1;"/><stop id="stop1946" offset="1" style="stop-color:#282433;stop-opacity:1"/></linearGradient><linearGradient id="linearGradient1020"><stop id="stop1016" offset="0" style="stop-color:#ffffff;stop-opacity:1;"/><stop id="stop1018" offset="1" style="stop-color:#ffffff;stop-opacity:0.09411765"/></linearGradient><linearGradient id="linearGradient1001"><stop id="stop989" offset="0" style="stop-color:#77767b;stop-opacity:1"/><stop style="stop-color:#c0bfbc;stop-opacity:1" offset="0.05" id="stop991"/><stop id="stop993" offset="0.09999998" style="stop-color:#9a9996;stop-opacity:1"/><stop style="stop-color:#9a9996;stop-opacity:1" offset="0.89999938" id="stop995"/><stop id="stop997" offset="0.94999999" style="stop-color:#c0bfbc;stop-opacity:1"/><stop id="stop999" offset="1" style="stop-color:#77767b;stop-opacity:1"/></linearGradient><linearGradient gradientUnits="userSpaceOnUse" y2="44" x2="464" y1="44" x1="48" id="linearGradient965" xlink:href="#linearGradient1001"/><radialGradient gradientUnits="userSpaceOnUse" gradientTransform="matrix(-4.7272726,7.935912e-7,-3.0301491e-7,-1.6363636,238.54547,49.766183)" r="44" fy="194.19048" fx="63.999996" cy="194.19048" cx="63.999996" id="radialGradient1030" xlink:href="#linearGradient1020"/><linearGradient gradientUnits="userSpaceOnUse" y2="269.13693" x2="70.346565" y1="245.39511" x1="70.346565" id="linearGradient1950" xlink:href="#linearGradient1948"/></defs><metadata id="metadata4"></metadata><g transform="translate(0,-172)" style="display:inline" id="layer1"><g style="display:inline" id="layer9"><g transform="rotate(-30,420.69873,288.4192)" id="g1710" style="display:inline;enable-background:new"/><rect transform="matrix(0.25,0,0,0.25,0,225)" style="display:inline;opacity:1;fill:url(#linearGradient965);fill-opacity:1;stroke:none;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;marker:none;marker-start:none;marker-mid:none;marker-end:none;paint-order:normal;enable-background:new" id="rect953" width="416" height="376" x="48" y="-124" rx="32" ry="32"/><rect ry="32" rx="32" y="-164" x="48" height="384" width="416" id="rect950" style="display:inline;opacity:1;fill:#deddda;fill-opacity:1;stroke:none;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;marker:none;marker-start:none;marker-mid:none;marker-end:none;paint-order:normal;enable-background:new" transform="matrix(0.25,0,0,0.25,0,225)"/><rect transform="scale(1,-1)" ry="3.9999695" rx="4" y="-276" x="16" height="87.999969" width="96" id="rect1004" style="display:inline;opacity:1;vector-effect:none;fill:#241f31;fill-opacity:1;stroke:none;stroke-width:0.01121096px;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;marker:none;marker-start:none;marker-mid:none;marker-end:none;paint-order:normal;enable-background:new"/><rect transform="scale(-1)" style="display:inline;opacity:0.05;vector-effect:none;fill:url(#radialGradient1030);fill-opacity:1;stroke:none;stroke-width:0.01121096px;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;marker:none;marker-start:none;marker-mid:none;marker-end:none;paint-order:normal;enable-background:new" id="rect968" width="88" height="78" x="-108" y="-272"/><g id="g976" transform="translate(-2,-2)" style="fill:#ffffff"><path d="M 44.012301,210.88755 30,203.27182 V 208 l 9.710724,4.62951 v 0.1422 L 30,218 v 4.72818 l 14.012301,-8.21451 z" style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:medium;line-height:1.25;font-family:'Source Code Pro';-inkscape-font-specification:'Source Code Pro, Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.24999999" id="path972"/><path d="m 47.999998,226 2e-6,4 h 16.00001 l -2e-6,-4 z" style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:medium;line-height:1.25;font-family:'Source Code Pro';-inkscape-font-specification:'Source Code Pro, Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.24999999" id="path974"/></g><path d="m 100,244 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m 84,4 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m 76,4 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m 84,4 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m 76,4 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m 84,4 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m 76,4 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z m -8,0 h 4 v 4 h -4 z" style="opacity:1;vector-effect:none;fill:url(#linearGradient1950);fill-opacity:1;stroke:none;stroke-width:8;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;marker:none;marker-start:none;marker-mid:none;marker-end:none;paint-order:normal" id="rect1059"/></g></g></svg>`
  );
const escapeHTML = (str) =>
  str.replace(/([<>'"&])/g, (_, l) => `&#${l.charCodeAt(0)};`);
const autoescaper = (strings, ...dangerous) => {
  let r = "";
  let i = 0;
  for (; i < strings.length; i++) {
    r += strings[i];
    if (i !== dangerous.length) r += escapeHTML(String(dangerous[i]));
  }
  return r;
};

const color = {
  color: ["#000000"],
  secondaryColor: ["#076b43", "#0b076b", "#6b0754"],
  tertiaryColor: [
    "#07f2ea",
    "#07f226",
    "#f207db",
    "#f207db",
    "#f28007",
    "#07f294",
  ],
};

const setCustomBlockColor = (newColor) => {
  Object.assign(color, newColor);
};

const customBlocks = {};
const customBlockParamNamesIdsDefaults = Object.create(null);
const getCustomBlock = (proccode) => {
  if (!Object.prototype.hasOwnProperty.call(customBlocks, proccode)) {
    return;
  }
  return customBlocks[proccode];
};
const getArgumentId = (index) => `arg${index}`;

const getNamesIdsDefaults = (blockData) => [
  blockData.args,
  blockData.args.map((_, i) => getArgumentId(i)),
  blockData.args.map(() => ""),
];
const parseArguments = (code) =>
  code
    .split(/(?=[^\\]%[nbs])/g)
    .map((i) => i.trim())
    .filter((i) => i.charAt(0) === "%")
    .map((i) => i.substring(0, 2));

const fixDisplayName = (displayName) =>
  displayName.replace(
    /([^\s])(%[nbs])/g,
    (_, before, arg) => `${before} ${arg}`
  );
const compareArrays = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let workspaceUpdateQueued = false;
const queueWorkspaceUpdate = () => {
  if (workspaceUpdateQueued) {
    return;
  }
  workspaceUpdateQueued = true;
  queueMicrotask(() => {
    workspaceUpdateQueued = false;
    if (vm.editingTarget) {
      vm.emitWorkspaceUpdate();
    }
  });
};
const addBlock = (proccode, { args, callback, hidden, displayName }) => {
  if (getCustomBlock(proccode)) {
    return;
  }
  const procCodeArguments = parseArguments(proccode);
  if (args.length !== procCodeArguments.length) {
    throw new Error(
      "Procedure code and argument list do not match! " +
        `Args:${args.length}; Procs:${procCodeArguments.length}`
    );
  }
  if (displayName) {
    displayName = fixDisplayName(displayName);
    const displayNameArguments = parseArguments(displayName);
    if (!compareArrays(procCodeArguments, displayNameArguments)) {
      console.warn(
        `block displayName ${displayName} for ${proccode} does not have matching arguments, ignoring it.`
      );
      displayName = proccode;
    }
  } else {
    displayName = proccode;
  }

  const blockData = {
    id: proccode,
    args,
    handler: callback,
    hide: !!hidden,
    displayName,
  };
  customBlocks[proccode] = blockData;
  customBlockParamNamesIdsDefaults[proccode] = getNamesIdsDefaults(blockData);
  queueWorkspaceUpdate();
};
const removeBlock = (proccode) => {
  customBlocks[proccode] = null;
  customBlockParamNamesIdsDefaults[proccode] = null;
};
const generateBlockXML = () => {
  let xml = "";
  for (const proccode of Object.keys(customBlocks)) {
    const blockData = customBlocks[proccode];
    if (blockData.hide) continue;
    const [names, ids, defaults] = getNamesIdsDefaults(blockData);
    xml +=
      '<block type="procedures_call" gap="16"><mutation generateshadows="true" warp="false"' +
      ` proccode="${escapeHTML(proccode)}"` +
      ` argumentnames="${escapeHTML(JSON.stringify(names))}"` +
      ` argumentids="${escapeHTML(JSON.stringify(ids))}"` +
      ` argumentdefaults="${escapeHTML(JSON.stringify(defaults))}"` +
      "></mutation></block>";
  }
  if (xml.length === 0) {
    const message = "No custom blocks.";
    return `<label text="${escapeHTML(message)}" showStatusButton="null" />`;
  }
  return xml;
};
const injectWorkspace = (ScratchBlocks) => {
  const BlockSvg = ScratchBlocks.BlockSvg;
  const oldUpdateColour = BlockSvg.prototype.updateColour;
  BlockSvg.prototype.updateColour = function (...args) {
    if (this.type === "procedures_call") {
      const block = this.procCode_ && getCustomBlock(this.procCode_);
      if (block) {
        this.colour_ =
          color.color[Math.floor(Math.random() * color.color.length) + 0];
        this.colourSecondary_ =
          color.secondaryColor[
            Math.floor(Math.random() * color.secondaryColor.length) + 0
          ];
        this.colourTertiary_ =
          color.tertiaryColor[
            Math.floor(Math.random() * color.tertiaryColor.length) + 0
          ];
        this.customContextMenu = null;
      }
    }
    return oldUpdateColour.call(this, ...args);
  };
  const originalGetBlocksXML = vm.runtime.getBlocksXML;
  vm.runtime.getBlocksXML = function (target) {
    const result = originalGetBlocksXML.call(this, target);
    result.unshift({
      id: "sa-blocks",
      xml:
        "<category" +
        ` name="${escapeHTML("SK2 Blocks")}"` +
        ' id="sa-blocks"' +
        ' colour="#32a852"' +
        ' secondaryColour="#000000"' +
        ` iconURI="${ICON}"` +
        `>${generateBlockXML()}</category>`,
    });
    return result;
  };
  const originalGetDefineBlock = ScratchBlocks.Procedures.getDefineBlock;
  ScratchBlocks.Procedures.getDefineBlock = function (procCode, workspace) {
    const result = originalGetDefineBlock.call(this, procCode, workspace);
    if (result) {
      return result;
    }
    const block = getCustomBlock(procCode);
    if (block) {
      return {
        workspace,
        getInput() {
          return {
            connection: {
              targetBlock() {
                return null;
              },
            },
          };
        },
      };
    }
    return result;
  };

  const originalCreateAllInputs =
    ScratchBlocks.Blocks["procedures_call"].createAllInputs_;
  ScratchBlocks.Blocks["procedures_call"].createAllInputs_ = function (
    ...args
  ) {
    const blockData = getCustomBlock(this.procCode_);
    if (blockData) {
      const originalProcCode = this.procCode_;
      this.procCode_ = blockData.displayName;
      const ret = originalCreateAllInputs.call(this, ...args);
      this.procCode_ = originalProcCode;
      return ret;
    }
    return originalCreateAllInputs.call(this, ...args);
  };
  queueWorkspaceUpdate();
};

let inited = false;
async function init() {
  if (inited) {
    return;
  }
  inited = true;

  const Blocks = vm.runtime.monitorBlocks.constructor;
  const originalGetProcedureParamNamesIdsAndDefaults =
    Blocks.prototype.getProcedureParamNamesIdsAndDefaults;
  Blocks.prototype.getProcedureParamNamesIdsAndDefaults =
    function getProcedureParamNamesIdsAndDefaultsWrapped(name) {
      return (
        customBlockParamNamesIdsDefaults[name] ||
        originalGetProcedureParamNamesIdsAndDefaults.call(this, name)
      );
    };

  const oldStepToProcedure = vm.runtime.sequencer.stepToProcedure;
  vm.runtime.sequencer.stepToProcedure = function (thread, proccode) {
    const blockData = getCustomBlock(proccode);
    if (blockData) {
      const stackFrame = thread.peekStackFrame();
      blockData.handler(stackFrame.params, thread);
      return;
    }
    return oldStepToProcedure.call(this, thread, proccode);
  };
  injectWorkspace(ScratchBlocks);
}
addBlock("alert %s", {
  args: ["content"],
  displayName: "block-alert",
  callback: ({ content }, thread) => {
    window.alert(content);
  },
});
addBlock("JavaScript %s", {
  args: ["content"],
  displayName: "block-js",
  callback: ({ content }, thread) => {
    window.eval(content);
  },
});
addBlock(
  "Save JavaScript to Variable: (Variable Name: %s ) (JavaScript: %s )",
  {
    args: ["vname", "js"],
    displayName: "block-savevar",
    hide: true,
    callback: ({ vname, js }, thread) => {
      vm.setVariableValue(
        thread.target.id,
        variableNameToId(vname),
        window.eval(js)
      );
    },
  }
);
addBlock("log to console %s", {
  args: ["content"],
  displayName: "block-log",
  callback: ({ content }, thread) => {
    console.log(content);
  },
});
addBlock("log warning to console %s", {
  args: ["content"],
  displayName: "block-warn",
  callback: ({ content }, thread) => {
    console.warn(content);
  },
});
addBlock("log error to console %s", {
  args: ["content"],
  displayName: "block-error",
  callback: ({ content }, thread) => {
    console.error(content);
  },
});
addBlock("clear console", {
  args: [],
  displayName: "clear console",
  callback: () => {
    console.clear();
  },
});
addBlock("inject console", {
  args: [],
  displayName: "inject console",
  callback: () => {
    (function () {
      var script = document.createElement("script");
      script.src = "//cdn.jsdelivr.net/npm/eruda";
      document.body.appendChild(script);
      script.onload = function () {
        eruda.init();
      };
    })();
  },
});
addBlock("rStore", {
  args: [],
  displayName: "rStore",
  callback: () => {
    window.alert("Made by ZXMushroom63 for rStore.");
  },
});
addBlock("Show HTML Box", {
  args: [],
  displayName: "Show HTML Box",
  callback: () => {
    document.getElementById("html_box").classList.remove("hidden");
  },
});
addBlock("Hide HTML Box", {
  args: [],
  displayName: "Hide HTML Box",
  callback: () => {
    document.getElementById("html_box").classList.add("hidden");
  },
});
addBlock("Clear HTML Box", {
  args: [],
  displayName: "Clear HTML Box",
  callback: () => {
    document.getElementById("html_box").srcdoc = "";
  },
});
addBlock("Set HTML of HTML Box to: %s", {
  args: ["content"],
  displayName: "block-log",
  callback: ({ content }, thread) => {
    document.getElementById("html_box").srcdoc = content;
  },
});
addBlock("Add HTML to HTML Box: %s", {
  args: ["content"],
  displayName: "block-log",
  callback: ({ content }, thread) => {
    document.getElementById("html_box").srcdoc += content;
  },
});
addBlock("Unfocus HTML Box", {
  args: [],
  displayName: "Unfocus HTML Box",
  callback: () => {
    document.getElementById("html_box").classList.add("unfocused");
  },
});
addBlock("Focus HTML Box", {
  args: [],
  displayName: "Focus HTML Box",
  callback: () => {
    document.getElementById("html_box").classList.remove("unfocused");
  },
});
init();
/*/End custom block script injection/*/
Blockly.getMainWorkspace().options.collapse = true;
createBlockContextMenu(
  (items, block) => {
    items.splice(items.length, 0, {
      enabled: true,
      text: "Collapse/Uncollapse",
      callback: () => {
        var collapse = !block.isCollapsed();
        var children = ScratchBlocks.getMainWorkspace()
          .getTopBlocks()[0]
          .getChildren();
        for (let i = 0; i < children.length; i++) {
          const e = array[i];
          e.setCollapsed(collapse);
        }
        block.setCollapsed(collapse);
      },
      separator: true,
    });

    return items;
  },
  { blocks: true }
);

/*/TurboWarp Player/*/
if (document.getElementById("turbowarp"))
  console.log("Detected element, skipping...");
else {
  var t = document.createElement("button");
  t.classList.add("button-7");
  (t.innerText = "⚡️"),
    (t.id = "turbowarp"),
    (t.onclick = function () {
      var e = `https://turbowarp.org/${
        location.pathname.split("/")[2]
      }/embed?x-origin=ScratchKit`;
      "yes" === window.prompt("Infinite Clones?", "yes") &&
        (e += "&clones=Infinity"),
        "yes" ===
          window.prompt(
            "Remove miscellanious limits? (size capping, etc)",
            "yes"
          ) && (e += "&limitless"),
        "yes" === window.prompt("60 FPS rather then 30", "no") &&
          (e += "&fps=60"),
        "yes" === window.prompt("Unlock X & Y limits?", "no") &&
          (e += "&offscreen"),
        "yes" === window.prompt("Non pixellated pen?", "no") && (e += "&hqpen"),
        "yes" === window.prompt("Smooth animations?", "no") &&
          (e += "&interpolate"),
        "yes" === window.prompt("Check for uncapped loops?", "no") &&
          (e += "&stuck"),
        window.open(e);
    }),
    document
      .getElementsByClassName("controls_controls-container_2xinB")[0]
      .appendChild(t);
}

/*/TurboWarp Packager/*/
if (document.getElementById("turbopack"))
  console.log("Detected element, skipping...");
else {
  var t = document.createElement("button");
  t.classList.add("button-7");
  (t.innerText = "\uD83D\uDCE6"),
    (t.id = "turbopack"),
    (t.onclick = function () {
      window.open(
        `https://packager.turbowarp.org/#${location.pathname.split("/")[2]}`
      );
    }),
    document
      .getElementsByClassName("controls_controls-container_2xinB")[0]
      .appendChild(t);
}

var inputObjectsList = [
  "text",
  "math_number",
  "math_angle",
  "math_integer",
  "math_whole_number",
  "math_positive_number",
  "colour_picker",
  "matrix",
  "note",
  "motion_goto_menu",
  "motion_pointtowards_menu",
  "looks_backdrops",
  "looks_costume",
  "sound_sounds_menu",
  "event_broadcast_menu",
  "control_create_clone_of_menu",
  "",
];

/*/Force zoom/*/
function forceZoom(e) {
  Blockly.getMainWorkspace().scale = e;
  Blockly.getMainWorkspace().grid_ &&
    Blockly.getMainWorkspace().grid_.update(this.scale);
  Blockly.getMainWorkspace().scrollbar
    ? Blockly.getMainWorkspace().scrollbar.resize()
    : Blockly.getMainWorkspace().translate(
        Blockly.getMainWorkspace().scrollX,
        Blockly.getMainWorkspace().scrollY
      );
  Blockly.getMainWorkspace().flyout_ &&
    Blockly.getMainWorkspace().flyout_.reflow();
}

/*/Forkphorus Packager/*/
if (document.getElementById("phork"))
  console.log("Detected element, skipping...");
else {
  var t = document.createElement("button");
  t.classList.add("button-7");
  (t.innerText = "\uD83D\uDD52"),
    (t.id = "phork"),
    (t.onclick = function () {
      window.open(
        `https://forkphorus.github.io/packager/#${
          location.pathname.split("/")[2]
        }`
      );
    }),
    document
      .getElementsByClassName("controls_controls-container_2xinB")[0]
      .appendChild(t);
}

/*/W3Schools Draggable DIV Tutorial/*/
function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    /*/ if present, the header is where you move the DIV from:/*/
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    document.getElementById(elmnt.id + "header").ontouchstart = dragMouseDown;
  } else {
    /*/otherwise, move the DIV from anywhere inside the DIV:/*/
    elmnt.onmousedown = dragMouseDown;
    elmnt.ontouchstart = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    /*/ get the mouse cursor position at startup:/*/
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.ontouchend = closeDragElement;
    document.ontouchcancel = closeDragElement;
    /*/ call a function whenever the cursor moves:/*/
    document.onmousemove = elementDrag;
    document.ontouchmove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    /*/ calculate the new cursor position:/*/
    pos1 = pos3 - (e.clientX || e.touches[0].clientX);
    pos2 = pos4 - (e.clientY || e.touches[0].clientY);
    pos3 = e.clientX || e.touches[0].clientX;
    pos4 = e.clientY || e.touches[0].clientY;
    /*/ set the element's new position:/*/
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    /*/ stop moving when mouse button is released:/*/
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchcancel = null;
    document.ontouchmove = null;
  }
}

/*/Save XML Editor/*/
function saveXML(xml) {
  console.log("loader[init]");
  Blockly.getMainWorkspace().clear();
  var e = Blockly.Xml.textToDom(xml);
  Blockly.Xml.domToWorkspace(Blockly.getMainWorkspace(), e);
}

/*/Load XML Editor/*/
function prepXML() {
  document.getElementById("xmlArea").innerText = formatXml(
    `${Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace()).outerHTML}`
  );
}

/*/Add a block to the workspace/*/
function addBlockToWorkspace(type) {
  var old_ = `${
    Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace()).outerHTML
  }`;
  var new_ = old_.replace(
    "</xml>",
    `<block type="${type}" id="${Math.random()}"></block></xml>`
  );
  Blockly.getMainWorkspace().clear();
  Blockly.Xml.domToWorkspace(
    Blockly.getMainWorkspace(),
    Blockly.Xml.textToDom(new_)
  );
}

/*/Add a block to the workspace/*/
function addPlugin(id, opt) {
  var xml = "";
  switch (id) {
    case "onkeypress":
      xml = `<block type="event_whenkeypressed" id="${Math.random()}"><field name="KEY_OPTION">${opt}</field></block>`;
      break;
    case "stopblock":
      xml = `<block type="control_stop" id="${Math.random()}"><mutation hasnext="false"></mutation><field name="STOP_OPTION">${opt}</field></block>`;
      break;
    case "effect":
      xml = `<block type="looks_seteffectto" id="${Math.random()}"><field name="EFFECT">${opt}</field><value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block>`;
      break;
    default:
      break;
  }
  var old_ = `${
    Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace()).outerHTML
  }`;
  var new_ = old_.replace("</xml>", `${xml}</xml>`);
  Blockly.getMainWorkspace().clear();
  Blockly.Xml.domToWorkspace(
    Blockly.getMainWorkspace(),
    Blockly.Xml.textToDom(new_)
  );
}

/*/Load Blocks tab/*/
function blocksTab() {
  var html =
    "<table><tr><td>Type</td><td>ID</td><td>Actions</td><td>Category</td></tr>";
  var blocks = Blockly.getMainWorkspace().topBlocks_;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    html += `
        <tr>
            <td>
                ${(() => {
                  if (block.type === "") {
                    return "variable";
                  }
                  return block.type;
                })()}
            </td>
            <td>
                ${block.id}
            </td>
            <td>
                <button title="Focus" class="button-7" onclick="Blockly.getMainWorkspace().centerOnBlock('${
                  block.id
                }');Blockly.getMainWorkspace().glowBlock('${
      block.id
    }',true)">👁️</button>
                <button title="Focus" class="button-7" onclick="Blockly.getMainWorkspace().getBlockById('${
                  block.id
                }').dispose();blocksTab();">🗑️</button>
            </td>
            <td>
                ${block.category_}
            </td>
        <tr>
    `;
  }
  html += "</table>";
  document.getElementById("blocksList").innerHTML = html;
}

function enableUwuCatBlocks() {
  const shouldWatchMouseCursor = !1;
  (ScratchBlocks.BlockSvg.START_HAT_HEIGHT = 31),
    (ScratchBlocks.BlockSvg.START_HAT_PATH =
      "c2.6,-2.3 5.5,-4.3 8.5,-6.2c-1,-12.5 5.3,-23.3 8.4,-24.8c3.7,-1.8 16.5,13.1 18.4,15.4c8.4,-1.3 17,-1.3 25.4,0c1.9,-2.3 14.7,-17.2 18.4,-15.4c3.1,1.5 9.4,12.3 8.4,24.8c3,1.8 5.9,3.9 8.5,6.1"),
    (ScratchBlocks.BlockSvg.prototype.renderCatFace_ = function () {
      this.catPath_.svgFace.setAttribute("fill", "#000000");
      var t = ScratchBlocks.utils.createSvgElement("path", {}, this.svgFace_);
      t.setAttribute(
        "d",
        "M25.2-1.1c0.1,0,0.2,0,0.2,0l8.3-2.1l-7-4.8c-0.5-0.3-1.1-0.2-1.4,0.3s-0.2,1.1,0.3,1.4L29-4.1l-4,1c-0.5,0.1-0.9,0.7-0.7,1.2C24.3-1.4,24.7-1.1,25.2-1.1z"
      ),
        t.setAttribute("fill-opacity", "0"),
        (this.catPath_.svgFace.closedEye = t);
      var e = ScratchBlocks.utils.createSvgElement("path", {}, this.svgFace_);
      e.setAttribute(
        "d",
        "M62.4-1.1c-0.1,0-0.2,0-0.2,0l-8.3-2.1l7-4.8c0.5-0.3,1.1-0.2,1.4,0.3s0.2,1.1-0.3,1.4l-3.4,2.3l4,1c0.5,0.1,0.9,0.7,0.7,1.2C63.2-1.4,62.8-1.1,62.4-1.1z"
      ),
        e.setAttribute("fill-opacity", "0"),
        (this.catPath_.svgFace.closedEye2 = e);
      var c = ScratchBlocks.utils.createSvgElement("circle", {}, this.svgFace_);
      c.setAttribute("cx", "59.2"),
        c.setAttribute("cy", "-3.3"),
        c.setAttribute("r", "3.4"),
        c.setAttribute("fill-opacity", "0.6"),
        (this.catPath_.svgFace.eye = c);
      var a = ScratchBlocks.utils.createSvgElement("circle", {}, this.svgFace_);
      a.setAttribute("cx", "29.1"),
        a.setAttribute("cy", "-3.3"),
        a.setAttribute("r", "3.4"),
        a.setAttribute("fill-opacity", "0.6"),
        (this.catPath_.svgFace.eye2 = a);
      var s = ScratchBlocks.utils.createSvgElement("path", {}, this.svgFace_);
      s.setAttribute(
        "d",
        "M45.6,0.1c-0.9,0-1.7-0.3-2.3-0.9c-0.6,0.6-1.3,0.9-2.2,0.9c-0.9,0-1.8-0.3-2.3-0.9c-1-1.1-1.1-2.6-1.1-2.8c0-0.5,0.5-1,1-1l0,0c0.6,0,1,0.5,1,1c0,0.4,0.1,1.7,1.4,1.7c0.5,0,0.7-0.2,0.8-0.3c0.3-0.3,0.4-1,0.4-1.3c0-0.1,0-0.1,0-0.2c0-0.5,0.5-1,1-1l0,0c0.5,0,1,0.4,1,1c0,0,0,0.1,0,0.2c0,0.3,0.1,0.9,0.4,1.2C44.8-2.2,45-2,45.5-2s0.7-0.2,0.8-0.3c0.3-0.4,0.4-1.1,0.3-1.3c0-0.5,0.4-1,0.9-1.1c0.5,0,1,0.4,1.1,0.9c0,0.2,0.1,1.8-0.8,2.8C47.5-0.4,46.8,0.1,45.6,0.1z"
      ),
        s.setAttribute("fill-opacity", "0.6"),
        this.catPath_.ear.setAttribute(
          "d",
          "M73.1-15.6c1.7-4.2,4.5-9.1,5.8-8.5c1.6,0.8,5.4,7.9,5,15.4c0,0.6-0.7,0.7-1.1,0.5c-3-1.6-6.4-2.8-8.6-3.6C72.8-12.3,72.4-13.7,73.1-15.6z"
        ),
        this.catPath_.ear.setAttribute("fill", "#FFD5E6"),
        this.catPath_.ear2.setAttribute(
          "d",
          "M22.4-15.6c-1.7-4.2-4.5-9.1-5.8-8.5c-1.6,0.8-5.4,7.9-5,15.4c0,0.6,0.7,0.7,1.1,0.5c3-1.6,6.4-2.8,8.6-3.6C22.8-12.3,23.2-13.7,22.4-15.6z"
        ),
        this.catPath_.ear2.setAttribute("fill", "#FFD5E6");
    }),
    (ScratchBlocks.BlockSvg.prototype.initCatStuff = function () {
      if (!this.hasInitCatStuff) {
        this.hasInitCatStuff = !0;
        var t = "c-1,-12.5 5.3,-23.3 8.4,-24.8c3.7,-1.8 16.5,13.1 18.4,15.4",
          e = "c-5.8,-4.8 -8,-18 -4.9,-19.5c3.7,-1.8 24.5,11.1 31.7,10.1",
          c = "c1.9,-2.3 14.7,-17.2 18.4,-15.4c3.1,1.5 9.4,12.3 8.4,24.8",
          a = "c7.2,1 28,-11.9 31.7,-10.1c3.1,1.5 0.9,14.7 -4.9,19.5",
          s =
            "c0,-7.1 3.7,-13.3 9.3,-16.9c1.7,-7.5 5.4,-13.2 7.6,-14.2c2.6,-1.3 10,6 14.6,11.1",
          i =
            "h33c4.6,-5.1 11.9,-12.4 14.6,-11.1c1.9,0.9 4.9,5.2 6.8,11.1c2.6,0,5.2,0,7.8,0",
          r =
            "c0,-4.6 1.6,-8.9 4.3,-12.3c-2.4,-5.6 -2.9,-12.4 -0.7,-13.4c2.1,-1 9.6,2.6 17,5.8c2.6,0 6.2,0 10.9,0",
          o =
            "c0,0 25.6,0 44,0c7.4,-3.2 14.8,-6.8 16.9,-5.8c1.2,0.6 1.6,2.9 1.3,5.8",
          l = this;
        (this.catPath_.ear = ScratchBlocks.utils.createSvgElement(
          "path",
          {},
          this.catPath_
        )),
          (this.catPath_.ear2 = ScratchBlocks.utils.createSvgElement(
            "path",
            {},
            this.catPath_
          )),
          this.RTL &&
            (this.catPath_.ear.setAttribute("transform", "scale(-1 1)"),
            this.catPath_.ear2.setAttribute("transform", "scale(-1 1)")),
          this.catPath_.addEventListener("mouseenter", function (t) {
            clearTimeout(l.blinkFn),
              t.target.svgFace.eye &&
                (t.target.svgFace.eye.setAttribute("fill-opacity", "0"),
                t.target.svgFace.eye2.setAttribute("fill-opacity", "0"),
                t.target.svgFace.closedEye.setAttribute("fill-opacity", "0.6"),
                t.target.svgFace.closedEye2.setAttribute(
                  "fill-opacity",
                  "0.6"
                )),
              (l.blinkFn = setTimeout(function () {
                t.target.svgFace.eye &&
                  (t.target.svgFace.eye.setAttribute("fill-opacity", "0.6"),
                  t.target.svgFace.eye2.setAttribute("fill-opacity", "0.6"),
                  t.target.svgFace.closedEye.setAttribute("fill-opacity", "0"),
                  t.target.svgFace.closedEye2.setAttribute(
                    "fill-opacity",
                    "0"
                  ));
              }, 100));
          }),
          this.catPath_.ear.addEventListener("mouseenter", function () {
            clearTimeout(l.earFn),
              clearTimeout(l.ear2Fn),
              l.catPath_.ear.setAttribute("fill-opacity", "0"),
              l.catPath_.ear2.setAttribute("fill-opacity", "");
            var h = l.catPath_.svgBody.getAttribute("d");
            (h = (h = (h = (h = h.replace(c, a)).replace(i, o)).replace(
              e,
              t
            )).replace(r, s)),
              l.catPath_.svgBody.setAttribute("d", h),
              (l.earFn = setTimeout(function () {
                l.catPath_.ear.setAttribute("fill-opacity", "");
                var t = l.catPath_.svgBody.getAttribute("d");
                (t = (t = t.replace(a, c)).replace(o, i)),
                  l.catPath_.svgBody.setAttribute("d", t);
              }, 50));
          }),
          this.catPath_.ear2.addEventListener("mouseenter", function () {
            clearTimeout(l.earFn),
              clearTimeout(l.ear2Fn),
              l.catPath_.ear2.setAttribute("fill-opacity", "0"),
              l.catPath_.ear.setAttribute("fill-opacity", "");
            var h = l.catPath_.svgBody.getAttribute("d");
            (h = (h = (h = (h = h.replace(t, e)).replace(s, r)).replace(
              a,
              c
            )).replace(o, i)),
              l.catPath_.svgBody.setAttribute("d", h),
              (l.ear2Fn = setTimeout(function () {
                l.catPath_.ear2.setAttribute("fill-opacity", "");
                var c = l.catPath_.svgBody.getAttribute("d");
                (c = (c = c.replace(e, t)).replace(r, s)),
                  l.catPath_.svgBody.setAttribute("d", c);
              }, 50));
          }),
          this.RTL && (this.svgFace_.style.transform = "translate(-87px, 0px)"),
          this.shouldWatchMouse() &&
            ((this.windowListener = function (t) {
              var e = Date.now();
              if (
                !(e < l.lastCallTime + l.CALL_FREQUENCY_MS) &&
                ((l.lastCallTime = e), l.shouldWatchMouse() && l.workspace)
              ) {
                var c = l.getCatFacePosition(),
                  a = {
                    x: t.x / l.workspace.scale,
                    y: t.y / l.workspace.scale,
                  },
                  s = a.x - c.x,
                  i = a.y - c.y,
                  r = Math.atan2(s, i),
                  o = Math.sqrt(s * s + i * i),
                  h = o / (o + 1),
                  n =
                    10 /
                    Math.sqrt(
                      Math.pow(5 * Math.cos(r), 2) +
                        Math.pow(2 * Math.sin(r), 2)
                    );
                (s = n * h * Math.sin(r)),
                  (i = n * h * Math.cos(r)),
                  l.RTL && (s -= 87),
                  (l.svgFace_.style.transform =
                    "translate(" + s + "px, " + i + "px)");
              }
            }),
            document.addEventListener("mousemove", this.windowListener));
      }
    });
  let workspacePositionRect = null;
  (ScratchBlocks.BlockSvg.prototype.getCatFacePosition = function () {
    workspacePositionRect ||
      (workspacePositionRect = this.workspace
        .getParentSvg()
        .getBoundingClientRect());
    var t = { x: workspacePositionRect.x, y: workspacePositionRect.y };
    !this.isInFlyout &&
      this.workspace.getFlyout() &&
      (t.x += this.workspace.getFlyout().getWidth()),
      (t.x += this.workspace.scrollX),
      (t.y += this.workspace.scrollY);
    var e = this.getRelativeToSurfaceXY(this.svgGroup_);
    return (
      this.RTL && (e.x = this.workspace.getWidth() - e.x - this.width),
      (e.x += t.x / this.workspace.scale),
      (e.y += t.y / this.workspace.scale),
      (e.x -= 43.5),
      (e.y -= 4),
      (e.x += 60),
      this.RTL && (e.x = screen.width - e.x),
      e
    );
  }),
    (ScratchBlocks.BlockSvg.prototype.shouldWatchMouse = function () {
      return !1;
    });
  const originalRenderDraw = ScratchBlocks.BlockSvg.prototype.renderDraw_;
  ScratchBlocks.BlockSvg.prototype.renderDraw_ = function (...t) {
    this.svgFace_ || this.sa_catBlockConstructor();
    const e = originalRenderDraw.call(this, ...t);
    return (
      this.outputConnection || this.previousConnection || this.initCatStuff(),
      this.startHat_ && !this.svgFace_.firstChild && this.renderCatFace_(),
      e
    );
  };
  const originalDispose = ScratchBlocks.BlockSvg.prototype.dispose;
  ScratchBlocks.BlockSvg.prototype.dispose = function (...t) {
    return (
      clearTimeout(this.blinkFn),
      clearTimeout(this.earFn),
      clearTimeout(this.ear2Fn),
      this.windowListener &&
        document.removeEventListener("mousemove", this.windowListener),
      originalDispose.call(this, ...t)
    );
  };
  const originalSetGlowStack = ScratchBlocks.BlockSvg.prototype.setGlowStack;
  (ScratchBlocks.BlockSvg.prototype.setGlowStack = function (t) {
    return (
      this.windowListener &&
        (t
          ? (document.removeEventListener("mousemove", this.windowListener),
            this.workspace &&
              this.svgFace_.style &&
              (this.RTL
                ? (this.svgFace_.style.transform = "translate(-87px, 0px)")
                : (this.svgFace_.style.transform = "")))
          : document.addEventListener("mousemove", this.windowListener)),
      originalSetGlowStack.call(this, t)
    );
  }),
    (ScratchBlocks.BlockSvg.prototype.sa_catBlockConstructor = function () {
      (this.catPath_ = ScratchBlocks.utils.createSvgElement(
        "g",
        {},
        this.svgGroup_
      )),
        (this.svgFace_ = ScratchBlocks.utils.createSvgElement(
          "g",
          {},
          this.catPath_
        )),
        (this.catPath_.svgFace = this.svgFace_),
        (this.catPath_.svgBody = this.svgPath_),
        (this.lastCallTime = 0),
        (this.CALL_FREQUENCY_MS = 60);
    });
  const workspace = ScratchBlocks.getMainWorkspace();
  if (workspace) {
    const t = workspace.getFlyout();
    if (t) {
      const e = t.getWorkspace();
      ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(
        ScratchBlocks.Xml.workspaceToDom(e),
        e
      ),
        workspace.getToolbox().refreshSelection(),
        (workspace.toolboxRefreshEnabled_ = !0);
    }
  }
}

/*/Load Vars Tab/*/
function varsTab() {
  var html =
    "<table><tr><td>Name</td><td>Type</td><td>Actions</td><td>Uses</td></tr>";
  var map = Blockly.getMainWorkspace().getVariableMap();
  var vars = Blockly.getMainWorkspace().getAllVariables();
  for (let i = 0; i < vars.length; i++) {
    const block = vars[i];
    html += `
        <tr>
            <td>
                ${block.name}
            </td>
            <td>
                ${block.type}
            </td>
            <td>
                <button title="Focus" class="button-7" onclick="Blockly.getMainWorkspace().getVariableMap().deleteVariableById('${
                  block.id_
                }');varsTab();">🗑️</button><button class="button-7" title="Focus" onclick="Blockly.getMainWorkspace().getVariableMap().renameVariableById('${
      block.id_
    }',window.prompt('New name for variable?','${
      block.name
    }'));varsTab();">✏️</button>
            </td>
            <td>
                ${map.getVariableUsesById(block.id_).length}
            </td>
        <tr>
    `;
  }
  html += "</table>";
  document.getElementById("varsList").innerHTML = html;
}

function clearOrphanBlocks(workspace) {
  if (window.confirm("Clean up blocks?") == false) {
    return;
  }
  function getTotalChildren(block) {
    var kids = block.childBlocks_;
    var total = 0;
    for (let i = 0; i < kids.length; i++) {
      const element = kids[i];
      if (!inputObjectsList.includes(element.type)) {
        total++;
      }
    }
    return total;
  }
  var topBlocks = workspace.getTopBlocks();
  var cc = 0;
  for (let i = 0; i < topBlocks.length; i++) {
    const block = topBlocks[i];
    if (getTotalChildren(block) === 0 && block.comment === null) {
      block.dispose();
      cc++;
    }
  }
  window.alert(`Cleared ${cc}/${topBlocks.length} block stacks.`);
}

function clearUnusedLocalVariables(workspace) {
  if (window.confirm("Clean up local variables?") == false) {
    return;
  }
  var vars = workspace.getAllVariables();
  var cc = 0;
  for (let i = 0; i < vars.length; i++) {
    const block = vars[i];
    if (
      block.isLocal === true &&
      workspace.getVariableMap().getVariableUsesById(block.id_).length === 0
    ) {
      workspace.getVariableMap().deleteVariableById(block.id_);
      cc++;
    }
  }
  window.alert(`Cleared ${cc}/${vars.length} variables and lists.`);
}

function totalBlocks() {
  var blocks = Blockly.getMainWorkspace().getAllBlocks();
  var a = 0;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (!inputObjectsList.includes(block.type)) {
      a++;
    }
  }
  return a;
}

function cloneCounter() {
  return vm.runtime._cloneCounter ?? 0;
}

function variableNameToId(name) {
  var preList = Blockly.getMainWorkspace().getVariableMap().variableMap_[""];
  preList.concat(
    Blockly.getMainWorkspace().getVariableMap().variableMap_["list"]
  );
  for (let i = 0; i < preList.length; i++) {
    const v = preList[i];
    if (v.name == name) {
      return v.id_;
    }
  }
  return "";
}

function initCanvasHTMLOverlay() {
  if (document.getElementById("html_box")) {
    document.getElementById("html_box").remove();
  } else {
    addEventListener("resize", () => {
      document
        .getElementById("html_box")
        .setAttribute(
          "style",
          `${document
            .getElementsByTagName("canvas")[0]
            .getAttribute(
              "style"
            )} transform: translate(0px, -100%); z-index:99;`
        );
    });
    addEventListener("click", () => {
      document
        .getElementById("html_box")
        .setAttribute(
          "style",
          `${document
            .getElementsByTagName("canvas")[0]
            .getAttribute(
              "style"
            )} transform: translate(0px, -100%); z-index:99;`
        );
    });
  }
  var htmlbox = document.createElement("iframe");
  htmlbox.id = "html_box";
  htmlbox.classList.add("hidden");
  htmlbox.setAttribute("frameborder","0")
  htmlbox.setAttribute(
    "style",
    `${document
      .getElementsByTagName("canvas")[0]
      .getAttribute("style")} transform: translate(0px, -100%); z-index:99;`
  );
  document.getElementsByTagName("canvas")[0].parentElement.appendChild(htmlbox);
}
initCanvasHTMLOverlay();
function totalTopBlocks() {
  return Blockly.getMainWorkspace().getTopBlocks().length ?? 0;
}

function totalVariables() {
  if (!Blockly.getMainWorkspace().getVariableMap().variableMap_[""]) {
    return 0;
  }
  return Blockly.getMainWorkspace().getVariableMap().variableMap_[""].length;
}

function totalLists() {
  if (!Blockly.getMainWorkspace().getVariableMap().variableMap_["list"]) {
    return 0;
  }
  return Blockly.getMainWorkspace().getVariableMap().variableMap_["list"]
    .length;
}

function totalComments() {
  return Blockly.getMainWorkspace().getTopComments().length ?? 0;
}

function cameraY() {
  return Math.trunc(Blockly.getMainWorkspace().scrollY);
}

function cameraX() {
  return Math.trunc(Blockly.getMainWorkspace().scrollX);
}

function saveScratchProject() {
  document.getElementsByClassName("save-status_save-now_2shdk")[0].click();
}

function initDisplay() {
  var display = document.createElement("div");
  display.id = "display";
  display.style = ``;
  document
    .getElementsByClassName("menu-bar_main-menu_3wjWH")[0]
    .appendChild(display);
}

function setDisplayContent(html) {
  document.getElementById("display").innerHTML = html;
}

function opacitizeBlocks(opacity) {
  var elems = document.getElementsByClassName("blocklyDraggable");
  for (let i = 0; i < elems.length; i++) {
    const element = elems[i];
    element.setAttribute("style", ``);
  }
  for (let i = 0; i < elems.length; i++) {
    const domBlock = elems[i];
    if (!domBlock.parentElement.classList.contains("blocklyDraggable")) {
      domBlock.setAttribute("style", `opacity:${opacity}`);
    }
  }
}

function opacitizeBlocksV2(opacity) {
  var elems = Blockly.getMainWorkspace().getAllBlocks();
  for (let i = 0; i < elems.length; i++) {
    const block = elems[i];
    block.setOpacity(opacity);
  }
}

/*/Get ready for theming checks to prevent errors./*/
window.theming = false;

function setColourTheme(x, y, z) {
  var elems = Blockly.getMainWorkspace().getAllBlocks();
  for (let i = 0; i < elems.length; i++) {
    const block = elems[i];
    if (!inputObjectsList.includes(block.type)) {
      block.setColour(x, y, z);
    }
  }
}

/*/Open Tab function/*/
function openTab(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}

/*/XML Formatter/*/
function formatXml(xml) {
  var formatted = "";
  var reg = /(>)(<)(\/*)/g;
  xml = xml.toString().replace(reg, "$1\r\n$2$3");
  var pad = 0;
  var nodes = xml.split("\r\n");
  for (var n in nodes) {
    var node = nodes[n];
    var indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/)) {
      if (pad !== 0) {
        pad -= 1;
      }
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }

    var padding = "";
    for (var i = 0; i < pad; i++) {
      padding += "  ";
    }

    formatted += padding + node + "\r\n"; /*/\\r\\n/*/
    pad += indent;
  }
  return formatted; /*/
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/ /g, "&nbsp;")/*/
}

/*/Style Injector. Mainly for Menu CSS/*/
function addStyle(styleString) {
  const style = document.createElement("style");
  style.textContent = styleString;
  document.head.append(style);
}

function maximiseModMenu() {
  if (!document.getElementById("menu").classList.contains("maximise")) {
    document.getElementById("menu").classList.add("maximise");
  }
}

function minimiseModMenu() {
  if (document.getElementById("menu").classList.contains("maximise")) {
    document.getElementById("menu").classList.remove("maximise");
  }
}

function closeModMenu() {
  document.getElementById("menu").remove();
}

function hideModMenu() {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("showbtn").classList.remove("hidden");
}
function showModMenu() {
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("showbtn").classList.add("hidden");
}

/*/Create the Draggable Menu/*/
var menu = document.createElement("div");
menu.id = "menu";
menu.innerHTML = `
<div id="menuheader">ScratchKit Editor v2<button class="button-7" onclick="minimiseModMenu()">🗖</button><button class="button-7" onclick="maximiseModMenu()">⛶</button><button class="button-7" onclick="hideModMenu()">✖</button></div>
<div class="tab">
  <button class="tablinks" onclick="openTab(event, 'XML'); prepXML();">XML</button>
  <button class="tablinks" onclick="openTab(event, 'Blocks'); blocksTab();">Blocks</button>
  <button class="tablinks" onclick="openTab(event, 'Options')">Options</button>
  <button class="tablinks" onclick="openTab(event, 'Store')">Store</button>
  <button class="tablinks" onclick="openTab(event, 'Snippets');">Snippets</button>
  <button class="tablinks" onclick="openTab(event, 'Vars'); varsTab();">Variables</button>
  <button class="tablinks" onclick="openTab(event, 'Help');">Help</button>
  <button class="tablinks" onclick="openTab(event, 'About')">About</button>
</div>
<div id="XML"class="tabcontent">
  <h3>XML Editor - <a title="Save Changes" href="javascript:saveXML(document.getElementById('xmlArea').innerText)">\uD83D\uDCBE</a></h3>
  <div id="xmlArea" contentEditable="true"></div>
</div>

<div id="Blocks" class="tabcontent">
  <h3>Blocks</h3>
  <button class="button-7" onclick="clearOrphanBlocks(Blockly.getMainWorkspace())" title="Clean Up Blocks">🧹</button>
  <div id="blocksList"></div>
</div>

<div id="Snippets" class="tabcontent">
  <h3>Snippets</h3>
  <button class="button-7" onclick="hideModMenu()">Hide Menu</button>
  <button class="button-7" onclick="maximiseModMenu()">Maximise Menu</button>
  <button class="button-7" onclick="minimiseModMenu()">Minimise Menu</button>
  <button class="button-7" onclick="closeModMenu()">Force Close Menu</button>
  <button class="button-7" onclick="document.getElementsByClassName('injectionDiv')[0].requestFullscreen()" title="JJScript">Fullscreen Editor</button>
</div>

<div id="Options" class="tabcontent">
  <h3>Options</h3>
  <p>Zoom</p>
  <input type="range" min="0.02" max="10" step="0.01" value="0.5" style="width:100%" onchange="forceZoom(this.value)"/>
  <p>Block Opacity</p>
  <input type="range" min="0.0" max="1.0" step="0.01" id="blockOpacity" value="1.0" style="width:100%" onchange="opacitizeBlocksV2(this.value)"/>
  <input type="checkbox" name="rtl" onchange="Blockly.getMainWorkspace().RTL = this.checked;Blockly.getMainWorkspace().options.RTL = this.checked;">
  <label for="rtl">Flipped Blocks</label><br>
  <input type="checkbox" name="readonly" onchange="Blockly.getMainWorkspace().options.readOnly = this.checked;">
  <label for="readonly">Read-Only</label><br>
  <input type="checkbox" name="comments" checked onchange="Blockly.getMainWorkspace().options.comments = this.checked;">
  <label for="comments">Comments</label><br>
  <input type="checkbox" name="vert" onchange="Blockly.getMainWorkspace().getToolbox().horizontalLayout_ = this.checked;">
  <label for="vert">Horizontal Toolbox</label><br><br>
  <details>
    <summary>> Theming</summary>
    <p>Custom Block Theming<button class="button-7" onclick="window.theming = true; this.remove(); setColourTheme(th1 ?? '#000000', th2 ?? '#000000', th3 ?? '#000000')">Enable Theming</button></p>
    <br>
    <input type="color" value="#9966ff" name="th1" onchange="window.th1=this.value; if (theming) { setColourTheme(th1, th2, th3); }"/><label for="th1">Color 1</label>
    <input type="color" value="#8a5ce6" name="th2" onchange="window.th2=this.value; if (theming) { setColourTheme(th1, th2, th3); }"/><label for="th2">Color 2</label>
    <input type="color" name="th3" onchange="window.th3=this.value; if (theming) { setColourTheme(th1, th2, th3); }"/><label for="th3">Color 3</label>
  </details>
  <br>
  <br>
  <br>
  <br>
  <button class="button-7" onclick="enableUwuCatBlocks();this.remove()">Enable Uwu Cats</button>
  <button class="button-7" onclick="Blockly.getMainWorkspace().getToolbox().horizontalLayout_=true;Blockly.getMainWorkspace().addTrashcan_(Blockly.getMainWorkspace());window.alert('Switch onto a tab other than code and then go back to see the changes.');this.remove()">Unlock Trashcan</button>
  <p>Tokyo is the capital of Japan.</p>
</div>

<div id="Store" class="tabcontent">
  <h3>Custom Plugin Store</h3>
  <table>
    <tr>
        <td>Name</td><td>Description</td>
    </tr>
    <tr>
        <td>
            <button class="button-7" onclick="addBlockToWorkspace('control_for_each')">For Each</button>
        </td>
        <td>
            Like a repeat block but automatically increments a variable.
        </td>
    </tr>
    <tr>
        <td>
            <button class="button-7" onclick="addBlockToWorkspace('sensing_distancetomenu')">Sprite Input</button>
        </td>
        <td>
            An input menu that references a sprite.
        </td>
    </tr>
    <tr>
        <td>
            <button class="button-7" onclick="addBlockToWorkspace('sensing_loud')">Loud?</button>
        </td>
        <td>
            Returns true if the loudness value is greater than 10.
        </td>
    </tr>
    <tr>
        <td>
            <button class="button-7" onclick="addBlockToWorkspace('event_whentouchingobject')">When Touching Object</button>
            <button class="button-7" onclick="addBlockToWorkspace('sensing_touchingobjectmenu')">Object Menu</button>
        </td>
        <td>
            This block activates when the sprite comes into contact with the selected object.
        </td>
    </tr>
    <tr>
        <td>
            <button class="button-7" onclick="addBlockToWorkspace('control_get_counter')">Get Counter</button>
            <button class="button-7" onclick="addBlockToWorkspace('control_incr_counter')">Increment Counter</button>
            <button class="button-7" onclick="addBlockToWorkspace('control_clear_counter')">Clear Counter</button>
        </td>
        <td>
            Before variables were a thing, you had to use these blocks.
        </td>
    </tr>
    <tr>
        <td>
            <button class="button-7" onclick="addBlockToWorkspace('matrix')">Matrix Input</button>
        </td>
        <td>
            A block that outputs a 25 character tring of binary. This binary represents the matrix gui that it offers. Can probably be useful in things like platformers.
        </td>
    </tr>
    <tr>
        <td>
            <button class="button-7" onclick="addBlockToWorkspace('note')">Note Block</button>
        </td>
        <td>
            A block that outputs a number representing a musical note. It ahas a nice piano GUI to give a visualisation.
        </td>
    </tr>
    <tr>
        <td>
            <button class="button-7" onclick="addBlockToWorkspace('colour_picker')">Colour Picker</button>
        </td>
        <td>
            PUT INTO A JOIN BLOCK IMMEDIATLY! A block that outputs a color hex code. Has the familiar HueSatBright formatted gui. Can be used as a functioning input in some pen blocks.
        </td>
    </tr>
    <tr>
        <td>
            <button class="button-7" onclick="addBlockToWorkspace('sensing_userid')">User ID (no-op)</button>
        </td>
        <td>
            A block that used to output the user name. It now does nothing.
        </td>
    </tr>
  </table>
  <br>
  <input type="text" id="keyId" value="/"/><button onclick="addPlugin('onkeypress', document.getElementById('keyId').value); this.blur()">+ Add Key Block</button><br>
  <input type="text" id="stopMessageId" value="noodling around"/><button onclick="addPlugin('stopblock', document.getElementById('stopMessageId').value); this.blur()">+ Add Stop Block</button><br>
  <input type="text" id="effectId" value="pointilize"/><button onclick="addPlugin('effect', document.getElementById('effectId').value); this.blur()">+ Add Effect Block</button><br>
  
</div>
<div id="Vars" class="tabcontent">
  <h3>Variables</h3>
  <button class="button-7" onclick="clearUnusedLocalVariables(Blockly.getMainWorkspace())" title="Remove Unused Local Variables">🧹</button>
  <div id="varsList"></div>
</div>
<div id="Help" class="tabcontent">
  <h3>Help</h3>
  <details>
    <summary>(Nearly) Complete Feature List</summary>
    <ul>
      <li>Hacks Blockly, AppState, VM and SoundEditor</li>
      <li>Adds custom blocks to allow for HTML and JavaScript within Scratch</li>
      <li>Adds back the Echo effect in the sound editor</li>
      <li>Options Tab allows for customizing look of blocks using opacity AND theming.</li>
      <li>Store tab allows to add hidden scratch blocks.</li>
      <li>Adds a heads up display to show stats in current sprite</li>
      <li>Blocks tab allows to view and quickly clean up blocks in the current sprite</li>
      <li>XML tab lets you modify the raw code of the sprite</li>
      <li>Enable all blocks to become Uwu cats in the options menu</li>
      <li>Controls for many things in the options menu</li>
      <li>Variables tab allows to view and clear unused local variables.</li>
      <li>Add custom key blocks at the bottom of the Store tab</li>
      <li>Flip blocks backwards in Options Tab (RTL)</li>
      <li>Export blocks to either PNG or SVG in the right-click menu.</li>
    </ul>
  </details>
  <details>
    <summary>The SK2 Blocks</summary>
    The new category, <a href="javascript:window.alert('SK2: Scratch Kit 2');">'SK2 Blocks'</a> adds multiple new blocks.<br>
    <table>
      <tr>
        <td>alert (text)</td>
        <td>The alert block will alert the text provided.<br>Args: Text</td>
      </tr>
      <tr>
        <td>JavaScript (js)</td>
        <td>The JS block run the javascript code it is given.<br>Args: JavaScript</td>
      </tr>
      <tr>
        <td>[tmp] Save JS to Var (sprite) (var) (js)</td>
        <td>This block will get a variable from a sprite, and set it's value to the javascript code.<br>Args: SpriteName, VariableName, JavaScript</td>
      </tr>
      <tr>
        <td>log to console (text)</td>
        <td>Logs text to the console.<br>Args: Text</td>
      </tr>
      <tr>
        <td>log warning to console (text)</td>
        <td>Logs text to the console as a warning.<br>Args: Text</td>
      </tr>
      <tr>
        <td>log error to console (text)</td>
        <td>Logs text to the console as an error.<br>Args: Text</td>
      </tr>
      <tr>
        <td>clear console</td>
        <td>Clears the console.</td>
      </tr>
      <tr>
        <td>inject console</td>
        <td>Injects the eruda console in to scratch.</td>
      </tr>
      <tr>
        <td>rStore</td>
        <td>Just so you know who made it.</td>
      </tr>
      <tr>
        <td>Show HTML Box</td>
        <td>(self explanatory)</td>
      </tr>
      <tr>
        <td>Hide HTML Box</td>
        <td>(self explanatory)</td>
      </tr>
      <tr>
        <td>Clear HTML Box</td>
        <td>Clears the html box of all html</td>
      </tr>
      <tr>
        <td>Set HTML of HTML Box to (html)</td>
        <td>Sets the content of the HTML Box.<br>Args: HTML</td>
      </tr>
      <tr>
        <td>Add HTML to HTML Box (html)</td>
        <td>Add html to the html box.<br>Args: HTML</td>
      </tr>
      <tr>
        <td>Unfocus HTML Box</td>
        <td>Makes it so that you interact with the project rather than the html box.</td>
      </tr>
      <tr>
        <td>Focus HTML Box</td>
        <td>Makes it so that you interact with the html box rather than the project. [default]</td>
      </tr>
    </table>
  </details><br>
  <details>
    <summary>The XML Tab</summary>
    The XML Tab represents the raw xml code of the current sprite. To modify it, just edit the text and press the save (💾) button.
    <br>It is important to note that this tab does not automatically update to prevent lag. To refresh the xml code to match the current, just click on the XML tab again.
  </details><br>
  <details>
    <summary>The Blocks Tab</summary>
    The Blocks tab is a collection of all the top blocks in the current sprite. All the top blocks are presented in a table. Each top block has 2 icons.<br>
    The View (👁️) button will center the camera on that block.<br>
    The Delete (🗑️) button will delete that block.<br>
    On top of the table is the Clean-Up (🧹) button. When clicked, it will delete all <a href="javascript:window.alert('Orphan: Blocks not connected to other blocks.');">'Orphan'</a> blocks.<br>
    Just like the XML tab, the Blocks tab does not update dynamically. To force it to update it's table, just click on the blocks tab again.
  </details><br>
  <details>
    <summary>The Options Tab</summary>
    The options tab contains controls for multiple things.<br>
    Click on '> Theming' to open the theming menu.
  </details><br>
  <details>
    <summary>The Store Tab</summary>
    The store tab contains buttons that add a hidden block to scratch.<br>
    Unlike the SK2 Blocks, these blocks work without the plugin activated.<br>
    At the very bottom of this tab, there are some custom block activators.
  </details><br>
  <details>
    <summary>The Snippets</summary>
    Contains nice snippets.<br>
    Generally used as a fallback for mobile.
  </details><br>
  <details>
    <summary>The Variables Tab</summary>
    Displays the variables of the current sprite along with some of their data.<br>
    Each variable has 2 actions: Delete (🗑️) and Rename (✏️).<br>
    Just like in the blocks tab, the variables tab has a clean up (🧹) button too. This one deletes all <a href="javascript:window.alert('Local variables with no uses.')">'unlocal'</a> variables.
  </details><br>
  <details>
    <summary>The Help Tab</summary>
    You're looking at it.
  </details><br>
  <details>
    <summary>The About Tab</summary>
    What about it?
  </details><br>
</div>
<div id="About" class="tabcontent">
  <h3>About</h3>
  <p>ScratchKit v2 is a powerful mod menu for scratch inspired by the original ScratchKit. Both were developed by me.</p><a href="https://github.com/ZXMushroom63/ScratchEditor">View Source</a>
</div>
`;

/*/Add CSS./*/
addStyle(`
#menu {
    all:initial;
    position: fixed;
    z-index: 89999999;
    background-color: #f1f1f1;
    border: 1px solid #d3d3d3;
    width:30%;
    height:45%;
    resize:both;
    overflow-y:scroll;
}
#xmlArea {
    width:100%
    height:100%;
    position:relative;
    overflow-y:scroll;
}
#showbtn {
  position:fixed;
  top:0;
  left:0;
  z-index: 99999999;
}
#menuheader {
    padding: 10px;
    cursor: move;
    z-index: 99999999;
    background-color: #2196F3;
    color: #fff;
    text-align: center;
}
/* Style the tab */
.tab {
  overflow: hidden;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
}

/* Style the buttons that are used to open the tab content */
.tab button {
  background-color: inherit;
  float: left;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 14px 16px;
  transition: 0.3s;
}

/* Change background color of buttons on hover */
.tab button:hover {
  background-color: #ddd;
}

/* Create an active/current tablink class */
.tab button.active {
  background-color: #ccc;
}

/* Style the tab content */
.tabcontent {
  display: none;
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-top: none;
}
tr:nth-child(even){background-color: #f2f2f2;}
tr:hover {background-color: #ddd;}
td, th {
  border: 1px solid #ddd;
  padding: 8px;
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
}

.button-7 {
  background-color: #0095ff;
  border: 1px solid transparent;
  border-radius: 3px;
  box-shadow: rgba(255, 255, 255, .4) 0 1px 0 0 inset;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-family: -apple-system,system-ui,"Segoe UI","Liberation Sans",sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.15385;
  margin: 0;
  outline: none;
  padding: 8px .8em;
  position: relative;
  text-align: center;
  text-decoration: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: baseline;
  white-space: nowrap;
}

.button-7:hover,
.button-7:focus {
  background-color: #07c;
}

.button-7:focus {
  box-shadow: 0 0 0 4px rgba(0, 149, 255, .15);
}

.button-7:active {
  background-color: #0064bd;
  box-shadow: none;
}

.maximise {
  width: 100% !important;
  height: 100% !important;
  resize: none !important;
  top: 0 !important;
  left: 0 !important;
}
.twitchInput {
  font-size: 14px;
  border-radius: 6px;
  line-height: 1.5;
  padding: 5px 10px;
  transition: box-shadow 100ms ease-in, border 100ms ease-in, background-color 100ms ease-in;
  border: 2px solid #dee1e2;
  color: rgb(14, 14, 16);
  background: #dee1e2;
  display: block;
  height: 36px;
}
.twitchInput:focus{
  border-color: #9147ff;
  background: #fff;
}
.twitchInput:hover {
  border-color: #ccc;
}
.hidden {
  display:none !important;
}
.unfocused {
  pointer-events:none !important;
}

.scratchCategoryItemBubble {
  position: relative;
}

.scratchCategoryItemBubble::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
.scratchCategoryId-motion .scratchCategoryItemBubble::after {
  background-image: url(//raw.githubusercontent.com/ZXMushroom63/ScratchEditor/main/icons/motion_icon.svg);
}

.scratchCategoryId-looks .scratchCategoryItemBubble::after {
  background-image: url(//raw.githubusercontent.com/ZXMushroom63/ScratchEditor/main/icons/looks_icon.svg);
}

.scratchCategoryId-sound .scratchCategoryItemBubble::after {
  background-image: url(//raw.githubusercontent.com/ZXMushroom63/ScratchEditor/main/icons/sound_icon.svg);
}

.scratchCategoryId-events .scratchCategoryItemBubble::after {
  background-image: url(//raw.githubusercontent.com/ZXMushroom63/ScratchEditor/main/icons/events_icon.svg);
}

.scratchCategoryId-control .scratchCategoryItemBubble::after {
  background-image: url(//raw.githubusercontent.com/ZXMushroom63/ScratchEditor/main/icons/control_icon.svg);
}

.scratchCategoryId-sensing .scratchCategoryItemBubble::after {
  background-image: url(//raw.githubusercontent.com/ZXMushroom63/ScratchEditor/main/icons/sensing_icon.svg);
}

.scratchCategoryId-operators .scratchCategoryItemBubble::after {
  background-image: url(//raw.githubusercontent.com/ZXMushroom63/ScratchEditor/main/icons/operators_icon.svg);
}

.scratchCategoryId-variables .scratchCategoryItemBubble::after {
  background-image: url(//raw.githubusercontent.com/ZXMushroom63/ScratchEditor/main/icons/variables_icon.svg);
}

.scratchCategoryId-lists .scratchCategoryItemBubble::after {
  background-image: url(//raw.githubusercontent.com/ZXMushroom63/ScratchEditor/main/icons/list_icon.svg);
}

.scratchCategoryId-myBlocks .scratchCategoryItemBubble::after {
  background-image: url(//raw.githubusercontent.com/ZXMushroom63/ScratchEditor/main/icons/block_icon.svg);
}
`);

/*/Make a button that shows the menu when clicked/*/
var showbtn = document.createElement("button");
showbtn.id = "showbtn";
showbtn.classList.add("button-7");
showbtn.classList.add("hidden");
showbtn.onclick = showModMenu;
showbtn.innerText = "⛶";

/*/Check if it already exists, and remove it if it does./*/
if (document.getElementById("menu")) {
  document.getElementById("menu").remove();
}

/*/Inject the menu and make it draggable/*/
document.body.appendChild(menu);
document.body.appendChild(showbtn);
dragElement(document.getElementById("menu"));

/*/Initialize the Forceir menu/*/
initForceir();

/*/Initialize display/*/
initDisplay();
setDisplayContent(`
  <table>
  <tr><td>${totalBlocks()} Block(s)</td><td>${totalVariables()} Variable(s)</td><td>${totalComments()} Comment(s)</td><td>${totalLists()} List(s)</td></tr>
  </table>
  `);
/*/Dynamic Opacity & Display Updates/*/
window.th1 = "#9966ff";
window.th2 = "#8a5ce6";
window.th3 = "#000000";
if (!window.kitTick) {
  window.kitTick = Blockly.getMainWorkspace().addChangeListener(() => {
    opacitizeBlocksV2(document.getElementById("blockOpacity").value ?? 1);
    if (theming) {
      setColourTheme(th1, th2, th3);
    }
    setDisplayContent(`
  <table>
  <tr><td>${totalBlocks()} Block(s)</td><td>${totalVariables()} Variable(s)</td><td>${totalComments()} Comment(s)</td><td>${totalLists()} List(s)</td></tr>
  </table>
  `);
    // blocksTab();
    /*/console.log("Refreshed opacity")/*/
  });
}

/*/Inject more modules/*/
injectScript(
  "//raw.githubusercontent.com/ZXMushroom63/ScratchEditor/main/libs/blocks2image.js"
);
injectScript(
  "//raw.githubusercontent.com/ZXMushroom63/ScratchEditor/main/libs/echo.js"
);
injectScript(
  "//raw.githubusercontent.com/ZXMushroom63/ScratchEditor/main/libs/numberpad.js"
);
injectScript(
  "//raw.githubusercontent.com/ZXMushroom63/ScratchEditor/main/libs/pause.js"
);
