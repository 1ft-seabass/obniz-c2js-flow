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

// Seeed_SHT35.cpp

#include "Seeed_SHT35.h"


function SHT35(u8 scl_pin, u8 IIC_ADDR) {
    set_iic_addr(IIC_ADDR);
    set_scl_pin(scl_pin);
    CLK_STRCH_STAT = CLK_STRETCH_DISABLE;
}

function init() {
    err_t ret = NO_ERROR;
    IIC_begin();
    ret = soft_reset();
    return ret;
}



function soft_reset() {
    err_t ret = NO_ERROR;
    ret = send_command(CMD_SOFT_RST);
    return ret;
}


function read_meas_data_single_shot(u16 cfg_cmd, float* temp, float* hum) {
    err_t ret = NO_ERROR;
    u8 data[6] = {0};
    u16 temp_hex = 0, hum_hex = 0;
    CHECK_RESULT(ret, send_command(cfg_cmd));
    CHECK_RESULT(ret, read_bytes(data, sizeof(data), CLK_STRCH_STAT));

    temp_hex = (data[0] << 8) | data[1];
    hum_hex = (data[3] << 8) | data[4];

    *temp = get_temp(temp_hex);
    *hum = get_hum(hum_hex);

    return ret;
}


function get_temp(u16 temp) {
    return (temp / 65535.00) * 175 - 45;
}

function get_hum(u16 hum) {
    return (hum / 65535.0) * 100.0;
}



u16 SHT35::temp_to_hex(float temp) {
    return (u16)((temp + 45) * 65535.0 / 175);
}

u16 SHT35::hum_to_hex(float hum) {
    return (u16)(hum / 100.0 * 65535);
}


/******************************************************STATUS REG**************************************************/
/******************************************************STATUS REG**************************************************/



function read_reg_status(u16* value) {
    err_t ret = NO_ERROR;
    *value = 0;
    u8 stat[3] = {0};
    CHECK_RESULT(ret, send_command(CMD_READ_SREG));
    CHECK_RESULT(ret, request_bytes(stat, sizeof(stat)));
    *value |= (u16)stat[0] << 8;
    *value |= stat[1];
    return ret;
}



function heaterStatus(u16 status, bool stat) {
    stat = ((status >> 13) & 0x01);
    return NO_ERROR;
}

function heaterStatus(bool stat) {
    err_t ret = NO_ERROR;
    u16 status = 0;
    CHECK_RESULT(ret, read_reg_status(&status));
    stat = ((status >> 13) & 0x01);
    return ret;
}
/****************************************************/



function reset_check(u16 status, bool stat) {
    stat = ((stat >> 4) & 0x01);
    return NO_ERROR;
}

function reset_check(bool stat) {
    err_t ret = NO_ERROR;
    u16 status = 0;
    CHECK_RESULT(ret, read_reg_status(&status));
    stat = ((stat >> 4) & 0x01);
    return ret;
}
/****************************************************/

function cmd_excu_stat(u16 status, bool stat) {
    stat = ((stat >> 1) & 0x01);
    return NO_ERROR;
}

function cmd_excu_stat(bool stat) {
    err_t ret = NO_ERROR;
    u16 status = 0;
    CHECK_RESULT(ret, read_reg_status(&status));
    stat = ((stat >> 1) & 0x01);
    return ret;
}
/****************************************************/
function last_write_checksum(u16 status, bool stat) {
    stat = ((status >> 0) & 0x01);
    return NO_ERROR;
}
function last_write_checksum(bool stat) {
    err_t ret = NO_ERROR;
    u16 status = 0;
    CHECK_RESULT(ret, read_reg_status(&status));
    stat = ((stat >> 0) & 0x01);
    return ret;
}

/***********************************************************************************************/
/**************************************EXEC COMMAND*********************************************/

function change_heater_status(bool stat) {
    err_t ret = NO_ERROR;

    if (stat) {
        ret = send_command(CMD_HEATER_ON);
    } else {
        ret = send_command(CMD_HEATER_OFF);
    }

    return ret;
}

/***********************************************************************************************/
/*****************************************IIC OPRT**********************************************/
u8 SHT_IIC_OPRTS::crc8(const u8* data, int len) {

    const u8 POLYNOMIAL = 0x31;
    u8 crc = 0xFF;

    for (int j = len; j; --j) {
        crc ^= *data++;

        for (int i = 8; i; --i) {
            crc = (crc & 0x80)
                  ? (crc << 1) ^ POLYNOMIAL
                  : (crc << 1);
        }
    }
    return crc;
}

function send_command(u16 cmd) {
    s32 ret = 0;
    Wire.beginTransmission(_IIC_ADDR);
    Wire.write((cmd >> 8) & 0xFF);
    Wire.write(cmd & 0xFF);
    ret = Wire.endTransmission();
    if (!ret) {
        return NO_ERROR;
    } else {
        return ERROR_COMM;
    }
}


function I2C_write_bytes(u16 cmd, u8* data, u32 len) {
    u8 crc = 0;
    s32 ret = 0;
    crc = crc8(data, len);

    Wire.beginTransmission(_IIC_ADDR);
    Wire.write((cmd >> 8) & 0xFF);
    Wire.write(cmd & 0xFF);
    //Wire.beginTransmission(_IIC_ADDR);
    for (int i = 0; i < len; i++) {
        Wire.write(data[i]);
    }
    Wire.write(crc);
    ret = Wire.endTransmission();
    if (!ret) {
        return NO_ERROR;
    } else {
        return ERROR_COMM;
    }
}

function request_bytes(u8* data, u16 data_len) {
    err_t ret = NO_ERROR;
    u32 time_out_count = 0;
    Wire.requestFrom(_IIC_ADDR, data_len);
    while (data_len != Wire.available()) {
        time_out_count++;
        if (time_out_count > 10) {
            return ERROR_COMM;
        }
        delay(1);
    }
    for (int i = 0; i < data_len; i++) {
        data[i] = Wire.read();
    }
    return NO_ERROR;
}

/*SHT3X device is different from other general IIC device.*/
function read_bytes(u8* data, u32 data_len, clk_skch_t clk_strch_stat) {
    err_t ret = NO_ERROR;
    u32 time_out_count = 0;
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
    for (int i = 0; i < data_len; i++) {
        data[i] = Wire.read();
    }
    return NO_ERROR;
}


function set_scl_pin(u8 scl) {
    SCK_PIN = scl;
}

/** @brief change the I2C address from default.
    @param IIC_ADDR: I2C address to be set
 * */
function set_iic_addr(u8 IIC_ADDR) {
    _IIC_ADDR = IIC_ADDR;
}

// obniz 実働コード

var Obniz = require("obniz");
var obniz = new Obniz("Obniz_ID");  // Obniz_ID は自分の obniz ID
obniz.onconnect = async function () {
  console.log("-- obniz start --");
}