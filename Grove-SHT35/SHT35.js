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
const CMD_READ_HIGH_ALERT_LIMIT_CLEAR_VALUE =0XE114;
const CMD_READ_LOW_ALERT_LIMIT_SET_VALUE =  0XE102;
const CMD_READ_LOW_ALERT_LIMIT_CLEAR_VALUE = 0XE109;

const CMD_WRITE_HIGH_ALERT_LIMIT_SET_VALUE = 0X611D;
const CMD_WRITE_HIGH_ALERT_LIMIT_CLEAR_VALUE = 0X6116;
const CMD_WRITE_LOW_ALERT_LIMIT_SET_VALUE = 0X6100;
const CMD_WRITE_LOW_ALERT_LIMIT_CLEAR_VALUE = 0X610B;

const HIGH_REP_WITH_STRCH = 0x2C06;

const CMD_HEATER_ON = 0x306D;
const CMD_HEATER_OFF = 0x3066;

var Obniz = require("obniz");
var obniz = new Obniz("Obniz_ID");  // Obniz_ID は自分の obniz ID
obniz.onconnect = async function () {
  console.log("-- obniz start --");
}