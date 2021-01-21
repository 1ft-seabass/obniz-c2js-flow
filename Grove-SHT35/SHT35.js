const NO_ERROR = 0;
const ERROR_PARAM = -1;
const ERROR_COMM = -2;
const ERROR_OTHERS = -128;

const DEFAULT_IIC_ADDR = 0x45;
const SHT35_IIC_ADDR = DEFAULT_IIC_ADDR;
const CMD_SOFT_RST = 0x30A2;

const HIGH_REP_WITH_STRCH = 0x2C06;

const CLK_STRETCH_DISABLE = 0;
const CLK_STRETCH_ENABLE = 1;

const CLK_STRCH_STAT = CLK_STRETCH_DISABLE;


async function init() {

  let vcc = 1;
  let gnd = 0;

  obniz.setVccGnd(vcc, gnd, "5v");
  obniz_i2c = obniz.getFreeI2C();
  let i2cres;
  try {
    i2cres = obniz_i2c.start({mode:"master", sda:2, scl:3, clock:400000, pull:"5v"});
  } catch(e) {
    console.log("error:",e);
  }

  let ret = NO_ERROR;
  ret = await send_command(CMD_SOFT_RST);
  return ret;
}


async function read_meas_data_single_shot(cfg_cmd) {
  let ret = NO_ERROR;
  let temp_hex = 0;
  let hum_hex = 0;
  let temp;
  let hum;

  ret = await send_command(cfg_cmd);
  // console.log("read_meas_data_single_shot 1 ret", ret);
  let data = await obniz_i2c.readWait(SHT35_IIC_ADDR, 6);
  // console.log("read_meas_data_single_shot data:",data);

  temp_hex = (data[0] << 8) | data[1];
  hum_hex = (data[3] << 8) | data[4];

  temp = (temp_hex / 65535.00) * 175 - 45;
  hum = (hum_hex / 65535.0) * 100.0;

  ret = {
    temp:temp,
    hum:hum
  }

  return ret;
}

async function send_command(cmd) {
  let ret = 0;

  let val1 = (cmd >> 8) & 0xFF;
  let val2 = cmd & 0xFF;
  ret = obniz_i2c.write(SHT35_IIC_ADDR, [val1,val2]);

  if (!ret) {
    return NO_ERROR;
  } else {
    return ERROR_COMM;
  }
}

// obniz 実働コード

var Obniz = require("obniz");
var obniz = new Obniz("Obniz_ID");  // Obniz_ID は自分の obniz ID
obniz.onconnect = async function () {
  console.log("-- obniz start --");
  
  await init();
  await obniz.wait(1000);

  while(true){

    let ret = await read_meas_data_single_shot(HIGH_REP_WITH_STRCH);
    console.log("-- SHT35 obniz --");
    console.log("temp",ret.temp);
    console.log("hum",ret.hum);

    await obniz.wait(1000);
  }

}