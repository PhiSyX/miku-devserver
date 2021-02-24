/* Ceci est un fichier d'exemple par défaut généré par miku-devserver */
(function () {
  const $el$html = document.documentElement;

  const DARK = "dark";
  const LIGHT = "light";

  /**
   * Change la couleur du thème ;
   * @param {MouseEvent} _evt
   */
  function handleChangeInputCheckbox(_evt) {
    const attr_name = "theme";
    const attr_value = $el$html.dataset[attr_name] || DARK;
    $el$html.dataset[attr_name] = attr_value === DARK ? LIGHT : DARK;
  }

  document.getElementById("js-theme")?.addEventListener(
    "change",
    handleChangeInputCheckbox,
  );
})();
