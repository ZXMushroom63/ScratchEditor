function addEchoEffect() {
  setTimeout(() => {
    if (document.getElementById("sk2_echo_button")) {
      document.getElementById("sk2_echo_button").remove();
    }
    var echoButton = document.createElement("div");
    echoButton.setAttribute("role", "button");
    echoButton.id = "sk2_echo_button";
    echoButton.className =
      "icon-button_container_278u5 sound-editor_effect-button_2zuzT";
    echoButton.addEventListener("click", () => {
      _getsoundeditor();
      SoundEditor.handleEffect("echo");
    });
    const echoIcon = Object.assign(document.createElement("img"), {
      src: "//raw.githubusercontent.com/ZXMushroom63/ScratchEditor/main/icons/echo.svg",
      draggable: false,
    });
    const echoTitleWrapper = Object.assign(document.createElement("div"), {
      className: "icon-button_title_36ChS",
    });
    const echoTitle = Object.assign(document.createElement("span"), {
      textContent: "Echo",
    });
    echoTitleWrapper.append(echoTitle);
    echoButton.append(echoIcon, echoTitleWrapper);
    document
      .getElementsByClassName(
        "sound-editor_row_3iFzH sound-editor_row-reverse_1qAAx"
      )[0]
      .appendChild(echoButton);
  }, 20);
}
document
  .getElementById("react-tabs-4")
  .addEventListener("click", addEchoEffect);
/*/SK2 Echo Effect for Sound Editor/*/
