var Obniz = require("obniz");
var obniz = new Obniz("Obniz_ID");  // Obniz_ID は自分の obniz ID
obniz.onconnect = async function () {
  console.log("-- obniz start --");
}