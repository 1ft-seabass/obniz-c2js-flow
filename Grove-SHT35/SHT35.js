// Seeed_SHT35.cpp の定数を持ってくる

typedef enum {
  NO_ERROR = 0,
  ERROR_PARAM = -1,
  ERROR_COMM = -2,
  ERROR_OTHERS = -128,
} err_t;


#define CHECK_RESULT(a,b)   do{if(a=b)  {    \
          SERIAL_DB.print(__FILE__);    \
          SERIAL_DB.print(__LINE__);   \
          SERIAL_DB.print(" error code =");  \
          SERIAL_DB.println(a);                   \
          return a;   \
      }}while(0)

#endif


#define     DEFAULT_IIC_ADDR     0x45
#define		NACK_ON_ADDR			2


#define		CLK_STRETCH_ENABLED		0
#define		CLK_STRETCH_DISABLED	3

#define		MODE_MPS_05				6
#define		MODE_MPS_1				9
#define		MODE_MPS_2				12
#define		MODE_MPS_4				15
#define		MODE_MPS_10				18

#define		REPEAT_HIGH				0
#define		REPEAT_MED				1
#define		REPEAT_LOW				2

#define		CMD_BREAK			0x3093
#define		CMD_SOFT_RST		0x30A2
#define		CMD_ENABLE_HEAT		0x306D
#define		CMD_DISABLE_HEAT	0x3066
#define		CMD_READ_SREG		0xF32D
#define		CMD_CLEAR_SREG		0x3041
#define		CMD_FETCH_DATA		0xE000

#define     CMD_READ_HIGH_ALERT_LIMIT_SET_VALUE     0XE11F
#define     CMD_READ_HIGH_ALERT_LIMIT_CLEAR_VALUE   0XE114
#define     CMD_READ_LOW_ALERT_LIMIT_SET_VALUE      0XE102
#define     CMD_READ_LOW_ALERT_LIMIT_CLEAR_VALUE    0XE109

#define     CMD_WRITE_HIGH_ALERT_LIMIT_SET_VALUE    0X611D
#define     CMD_WRITE_HIGH_ALERT_LIMIT_CLEAR_VALUE  0X6116
#define     CMD_WRITE_LOW_ALERT_LIMIT_SET_VALUE     0X6100
#define     CMD_WRITE_LOW_ALERT_LIMIT_CLEAR_VALUE     0X610B

#define     HIGH_REP_WITH_STRCH      0x2C06

#define     CMD_HEATER_ON     0x306D
#define     CMD_HEATER_OFF    0x3066

var Obniz = require("obniz");
var obniz = new Obniz("Obniz_ID");  // Obniz_ID は自分の obniz ID
obniz.onconnect = async function () {
  console.log("-- obniz start --");
}