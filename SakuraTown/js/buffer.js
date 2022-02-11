function renderColorByTime() {
  let ins = new Date();
  if (parseInt(ins.getHours()) > 17 || parseInt(ins.getHours()) < 8) {
    $("body").addClass("darkTheme");
    return;
  }
  $("body").addClass("lightTheme");
}
