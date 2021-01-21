// この enum は変数指定と変わらない
/*
typedef enum {
  NO_ERROR = 0,
  ERROR_PARAM = -1,
  ERROR_COMM = -2,
  ERROR_OTHERS = -128,
} err_t;
*/

const NO_ERROR = 0;
const ERROR_PARAM = -1;
const ERROR_COMM = -2;
const ERROR_OTHERS = -128;

// VSCode で next occurrence Ctrl+D を多用して空白を選択し一括編集していく

const DEFAULT_IIC_ADDR = 0x45;
const SHT35_IIC_ADDR = DEFAULT_IIC_ADDR;
const NACK_ON_ADDR = 2;

const CLK_STRETCH_ENABLED = 0;
const CLK_STRETCH_DISABLED = 3;

const MODE_MPS_05 = 6;
const MODE_MPS_1 = 9;
const MODE_MPS_2 = 12;
const MODE_MPS_4 = 15;
const MODE_MPS_10 = 18;

const REPEAT_HIGH = 0;
const REPEAT_MED = 1;
const REPEAT_LOW = 2;

const CMD_BREAK = 0x3093;
const CMD_SOFT_RST = 0x30A2;
const CMD_ENABLE_HEAT = 0x306D;
const CMD_DISABLE_HEAT = 0x3066;
const CMD_READ_SREG = 0xF32D;
const CMD_CLEAR_SREG = 0x3041;
const CMD_FETCH_DATA = 0xE000;

const CMD_READ_HIGH_ALERT_LIMIT_SET_VALUE = 0XE11F;
const CMD_READ_HIGH_ALERT_LIMIT_CLEAR_VALUE = 0XE114;
const CMD_READ_LOW_ALERT_LIMIT_SET_VALUE = 0XE102;
const CMD_READ_LOW_ALERT_LIMIT_CLEAR_VALUE = 0XE109;

const CMD_WRITE_HIGH_ALERT_LIMIT_SET_VALUE = 0X611D;
const CMD_WRITE_HIGH_ALERT_LIMIT_CLEAR_VALUE = 0X6116;
const CMD_WRITE_LOW_ALERT_LIMIT_SET_VALUE = 0X6100;
const CMD_WRITE_LOW_ALERT_LIMIT_CLEAR_VALUE = 0X610B;

const HIGH_REP_WITH_STRCH = 0x2C06;

const CMD_HEATER_ON = 0x306D;
const CMD_HEATER_OFF = 0x3066;

// Seeed_SHT35.cpp

/*
function SHT35(scl_pin, IIC_ADDR) {
  set_iic_addr(IIC_ADDR);
  set_scl_pin(scl_pin);
  CLK_STRCH_STAT = CLK_STRETCH_DISABLE;
}
*/

/*
typedef enum {
  CLK_STRETCH_DISABLE,
  CLK_STRETCH_ENABLE,
} clk_skch_t;
*/

const CLK_STRETCH_DISABLE = 0;
const CLK_STRETCH_ENABLE = 1;

const CLK_STRCH_STAT = CLK_STRETCH_DISABLE;


async function init() {

  // I2C を使えるようにする
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


function read_meas_data_single_shot(cfg_cmd, temp, hum) {
  let ret = NO_ERROR;
  // let data[6] = {0}; // 6つの構造体を初期化している
  data = [0, 0, 0, 0, 0, 0]; // 置き換え
  let temp_hex = 0, hum_hex = 0;

  // CHECK_RESULT は検証ログのようなもの
  // read_bytes は obniz の i2c.readWait に置き換え可能
  // CHECK_RESULT(ret, send_command(cfg_cmd));
  // CHECK_RESULT(ret, read_bytes(data, sizeof(data), CLK_STRCH_STAT));

  ret = await send_command(cfg_cmd);
  // console.log("read_meas_data_single_shot 1 ret", ret);
  let data = await obniz_i2c.readWait(SHT35_IIC_ADDR, 6);
  // console.log("read_meas_data_single_shot data:",data);

  temp_hex = (data[0] << 8) | data[1];
  hum_hex = (data[3] << 8) | data[4];

  temp = get_temp(temp_hex);
  hum = get_hum(hum_hex);

  return ret;
}


function get_temp(temp) {
  return (temp / 65535.00) * 175 - 45;
}

function get_hum(hum) {
  return (hum / 65535.0) * 100.0;
}

async function send_command(cmd) {
  let ret = 0;

  /*
  Wire.beginTransmission(_IIC_ADDR);
  Wire.write((cmd >> 8) & 0xFF);
  Wire.write(cmd & 0xFF);
  ret = Wire.endTransmission();
  */

  let val1 = (cmd >> 8) & 0xFF;
  let val2 = cmd & 0xFF;
  ret = obniz_i2c.write(SHT35_IIC_ADDR, [val1,val2]);

  if (!ret) {
    return NO_ERROR;
  } else {
    return ERROR_COMM;
  }
}

function request_bytes(data, data_len) {
  let ret = NO_ERROR;
  let time_out_count = 0;
  Wire.requestFrom(_IIC_ADDR, data_len);
  while (data_len != Wire.available()) {
    time_out_count++;
    if (time_out_count > 10) {
      return ERROR_COMM;
    }
    delay(1);
  }
  for (let i = 0; i < data_len; i++) {
    data[i] = Wire.read();
  }
  return NO_ERROR;
}

/*SHT3X device is different from other general IIC device.*/
function read_bytes(data, data_len, clk_strch_stat) {
  let ret = NO_ERROR;
  let time_out_count = 0;
  if (clk_strch_stat == CLK_STRETCH_ENABLE) {
    while (0 == digitalRead(SCK_PIN)) {
      yield();
    }
  } else {
    Wire.beginTransmission(_IIC_ADDR);
    while (Wire.endTransmission() == NACK_ON_ADDR) {
      Wire.beginTransmission(_IIC_ADDR);
    }
  }

  Wire.requestFrom(_IIC_ADDR, data_len);
  while (data_len != Wire.available()) {
    time_out_count++;
    if (time_out_count > 10) {
      return ERROR_COMM;
    }
    delay(1);
  }
  for (let i = 0; i < data_len; i++) {
    data[i] = Wire.read();
  }
  return NO_ERROR;
}

// obniz 実働コード

var Obniz = require("obniz");
var obniz = new Obniz("Obniz_ID");  // Obniz_ID は自分の obniz ID
obniz.onconnect = async function () {
  console.log("-- obniz start --");

  // https://wiki.seeedstudio.com/Grove-I2C_High_Accuracy_Temp%26Humi_Sensor-SHT35/
  // こちらの実装に合わせて setup 関数を導入

  /*
  SERIAL.begin(115200);
  delay(10);
  SERIAL.println("serial start!!");
  if(sensor.init())
  {
    SERIAL.println("sensor init failed!!!");
  }
  delay(1000);
  */
  
  // init と delay 1000 をひとまず移植
  await init();
  await obniz.wait(1000);

　/*
  u16 value=0;
  u8 data[6]={0};
  float temp,hum;
  if(NO_ERROR!=sensor.read_meas_data_single_shot(HIGH_REP_WITH_STRCH,&temp,&hum))
  {
    SERIAL.println("read temp failed!!");
    SERIAL.println("   ");
    SERIAL.println("   ");
    SERIAL.println("   ");
  }
  else
  {
    SERIAL.println("result======>");
    SERIAL.print("temperature =");
    SERIAL.println(temp);

    SERIAL.print("humidity =");
    SERIAL.println(hum);

    SERIAL.println("   ");
    SERIAL.println("   ");
    SERIAL.println("   ");
  }
  delay(1000);
  */

  while(true){

    // read_meas_data_single_shot(HIGH_REP_WITH_STRCH,&temp,&hum)
    let ret = await read_meas_data_single_shot(HIGH_REP_WITH_STRCH);
    console.log("-- SHT35 obniz --");
    console.log("temp",ret.temp);
    console.log("hum",ret.hum);

    await obniz.wait(1000);
  }

}