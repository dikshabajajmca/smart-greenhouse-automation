# =====================================
# SMART GREENHOUSE - WOKWI ESP32
# =====================================

import network
import time
import framebuf
import urequests

from machine import Pin, ADC, I2C, PWM
import dht


# =====================================
# SSD1306 OLED DRIVER
# =====================================

SET_CONTRAST = 0x81
DISPLAY_ON = 0xAF
DISPLAY_OFF = 0xAE
SET_MEMORY_MODE = 0x20
SET_COLUMN_ADDR = 0x21
SET_PAGE_ADDR = 0x22
SET_DISP_START_LINE = 0x40
SET_SEG_REMAP = 0xA0
SET_MUX_RATIO = 0xA8
SET_COM_OUT_DIR = 0xC0
SET_DISP_OFFSET = 0xD3
SET_COM_PIN_CFG = 0xDA
SET_DISP_CLK_DIV = 0xD5
SET_PRECHARGE = 0xD9
SET_VCOM_DESEL = 0xDB
SET_CHARGE_PUMP = 0x8D


class SSD1306:

    def __init__(self, width, height, external_vcc=False):

        self.width = width
        self.height = height
        self.external_vcc = external_vcc
        self.pages = height // 8

        self.buffer = framebuf.FrameBuffer(
            bytearray(self.pages * width),
            width,
            height,
            framebuf.MONO_VLSB
        )

        self.init_display()

    def init_display(self):

        self.write_cmd(SET_DISP_CLK_DIV)
        self.write_cmd(0x80)

        self.write_cmd(SET_MUX_RATIO)
        self.write_cmd(self.height - 1)

        self.write_cmd(SET_DISP_OFFSET)
        self.write_cmd(0x00)

        self.write_cmd(SET_DISP_START_LINE | 0x00)

        self.write_cmd(SET_CHARGE_PUMP)

        self.write_cmd(
            0x10 if self.external_vcc else 0x14
        )

        self.write_cmd(SET_MEMORY_MODE)
        self.write_cmd(0x00)

        self.write_cmd(SET_SEG_REMAP | 0x01)
        self.write_cmd(SET_COM_OUT_DIR | 0x08)

        self.write_cmd(SET_COM_PIN_CFG)

        self.write_cmd(
            0x02 if self.height == 32 else 0x12
        )

        self.write_cmd(SET_CONTRAST)
        self.write_cmd(0x8F)

        self.write_cmd(SET_PRECHARGE)

        self.write_cmd(
            0x22 if self.external_vcc else 0xF1
        )

        self.write_cmd(SET_VCOM_DESEL)
        self.write_cmd(0x30)

        self.write_cmd(0xA4)
        self.write_cmd(0xA6)

        self.write_cmd(DISPLAY_ON)

        self.fill(0)
        self.show()

    def write_cmd(self, cmd):
        raise NotImplementedError

    def write_data(self, buf):
        raise NotImplementedError

    def show(self):

        x0 = 0
        x1 = self.width - 1

        if self.width == 64:
            x0 += 32
            x1 += 32

        self.write_cmd(SET_COLUMN_ADDR)
        self.write_cmd(x0)
        self.write_cmd(x1)

        self.write_cmd(SET_PAGE_ADDR)
        self.write_cmd(0)
        self.write_cmd(self.pages - 1)

        self.write_data(self.buffer)

    def fill(self, col):
        self.buffer.fill(col)

    def text(self, string, x, y, col=1):
        self.buffer.text(string, x, y, col)


class SSD1306_I2C(SSD1306):

    def __init__(
        self,
        width,
        height,
        i2c,
        addr=0x3C,
        external_vcc=False
    ):

        self.i2c = i2c
        self.addr = addr
        self.temp = bytearray(2)

        super().__init__(
            width,
            height,
            external_vcc
        )

    def write_cmd(self, cmd):

        self.temp[0] = 0x80
        self.temp[1] = cmd

        self.i2c.writeto(
            self.addr,
            self.temp
        )

    def write_data(self, buf):

        self.i2c.writeto(
            self.addr,
            b"\x40" + buf
        )


# =====================================
# WIFI
# =====================================

print("================================")
print("SMART GREENHOUSE STARTING")
print("================================")

wifi = network.WLAN(network.STA_IF)

wifi.active(True)

wifi.connect(
    "Wokwi-GUEST",
    ""
)

wifi_connected = False

for i in range(20):

    if wifi.isconnected():

        wifi_connected = True

        print("WiFi Connected")
        print(
            "IP:",
            wifi.ifconfig()[0]
        )

        break

    print(
        "WiFi connecting...",
        i + 1
    )

    time.sleep(0.5)


if not wifi_connected:

    print("WiFi not available")


# =====================================
# DHT22
# =====================================

dht_sensor = dht.DHT22(
    Pin(
        4,
        Pin.IN,
        Pin.PULL_UP
    )
)

last_temperature = 32
last_humidity = 65


# =====================================
# SOIL MOISTURE
# =====================================

soil = ADC(
    Pin(34)
)

soil.atten(
    ADC.ATTN_11DB
)


# =====================================
# RELAY / WATER PUMP
# =====================================

relay = Pin(
    26,
    Pin.OUT
)

relay.value(0)


# =====================================
# SERVO / VENTILATION
# =====================================

servo = PWM(
    Pin(25),
    freq=50
)


def set_servo(angle):

    if angle < 0:
        angle = 0

    if angle > 90:
        angle = 90

    duty = int(
        26 + (angle / 180) * 102
    )

    servo.duty(duty)


# =====================================
# OLED
# =====================================

oled = None
oled_available = False

try:

    i2c = I2C(
        0,
        scl=Pin(22),
        sda=Pin(21)
    )

    print(
        "OLED I2C devices:",
        i2c.scan()
    )

    oled = SSD1306_I2C(
        128,
        64,
        i2c,
        addr=0x3C
    )

    oled_available = True

    print("OLED Connected")

except Exception as e:

    print(
        "OLED unavailable:",
        e
    )


# =====================================
# START SCREEN
# =====================================

if oled_available:

    try:

        oled.fill(0)

        oled.text(
            "SMART",
            35,
            5
        )

        oled.text(
            "GREENHOUSE",
            15,
            20
        )

        oled.text(
            "SYSTEM READY",
            15,
            40
        )

        oled.show()

        time.sleep(2)

    except Exception as e:

        print(
            "OLED display error:",
            e
        )

        oled_available = False


# =====================================
# SEND TELEMETRY
# =====================================

def send_telemetry(
    temperature,
    humidity,
    soil_moisture
):

    if not wifi_connected:

        print(
            "Telemetry skipped - WiFi offline"
        )

        return

    try:

        telemetry = {
            "type": "telemetry",
            "temperature": temperature,
            "humidity": humidity,
            "soilMoisture": soil_moisture
        }

        response = urequests.post(
            "http://host.wokwi.internal:3000/telemetry",
            json=telemetry
        )

        print(
            "Telemetry sent:",
            telemetry
        )

        print(
            "Server status:",
            response.status_code
        )

        response.close()

    except Exception as e:

        print(
            "Telemetry error:",
            e
        )


# =====================================
# CHECK COMMANDS FROM NODE
# =====================================

def check_commands(
    current_pump,
    current_window
):

    if not wifi_connected:

        return (
            current_pump,
            current_window
        )

    try:

        response = urequests.get(
            "http://host.wokwi.internal:3000/commands"
        )

        data = response.json()

        response.close()

        commands = data.get(
            "commands",
            []
        )

        for command in commands:

            print(
                "Command received:",
                command
            )

            command_name = command.get(
                "command"
            )

            # -------------------------
            # PUMP
            # -------------------------

            if command_name == "PUMP":

                state = command.get(
                    "state",
                    "OFF"
                )

                if state == "ON":

                    relay.value(1)

                    current_pump = "ON"

                    print(
                        "Pump -> ON"
                    )

                else:

                    relay.value(0)

                    current_pump = "OFF"

                    print(
                        "Pump -> OFF"
                    )

            # -------------------------
            # WINDOW
            # -------------------------

            elif command_name == "SET_WINDOW":

                angle = int(
                    command.get(
                        "angle",
                        0
                    )
                )

                if angle < 0:
                    angle = 0

                if angle > 90:
                    angle = 90

                set_servo(angle)

                current_window = angle

                print(
                    "Window ->",
                    angle
                )

    except Exception as e:

        print(
            "Command check error:",
            e
        )

    return (
        current_pump,
        current_window
    )


# =====================================
# MAIN LOOP
# =====================================

while True:

    try:

        # ---------------------------------
        # DHT22
        # ---------------------------------

        try:

            dht_sensor.measure()

            last_temperature = (
                dht_sensor.temperature()
            )

            last_humidity = (
                dht_sensor.humidity()
            )

            print(
                "DHT22 OK"
            )

        except Exception as e:

            print(
                "DHT22 unavailable - using fallback:",
                e
            )

        temperature = last_temperature
        humidity = last_humidity


        # ---------------------------------
        # SOIL
        # ---------------------------------

        soil_value = soil.read()

        soil_moisture = int(
            soil_value * 100 / 4095
        )


        # ---------------------------------
        # AUTOMATIC WATER PUMP
        # ---------------------------------

        if (
            temperature > 30
            and soil_moisture < 30
        ):

            relay.value(1)

            pump = "ON"

        else:

            relay.value(0)

            pump = "OFF"


        # ---------------------------------
        # AUTOMATIC VENTILATION
        # ---------------------------------

        if temperature > 30:

            set_servo(90)

            window = 90

        else:

            set_servo(0)

            window = 0


        # ---------------------------------
        # SEND TELEMETRY
        # ---------------------------------

        send_telemetry(
            temperature,
            humidity,
            soil_moisture
        )


        # ---------------------------------
        # CHECK BROWSER COMMANDS
        # ---------------------------------

        pump, window = check_commands(
            pump,
            window
        )


        # ---------------------------------
        # OLED UPDATE
        # ---------------------------------

        if oled_available:

            try:

                oled.fill(0)

                oled.text(
                    "GREENHOUSE",
                    15,
                    0
                )

                oled.text(
                    "Temp: {} C".format(
                        temperature
                    ),
                    0,
                    14
                )

                oled.text(
                    "Hum: {} %".format(
                        humidity
                    ),
                    0,
                    26
                )

                oled.text(
                    "Soil: {} %".format(
                        soil_moisture
                    ),
                    0,
                    38
                )

                oled.text(
                    "Pump: {}".format(
                        pump
                    ),
                    0,
                    50
                )

                oled.show()

            except Exception as e:

                print(
                    "OLED update failed:",
                    e
                )

                oled_available = False


        # ---------------------------------
        # TERMINAL OUTPUT
        # ---------------------------------

        print(
            "----------------------------"
        )

        print(
            "Temperature:",
            temperature
        )

        print(
            "Humidity:",
            humidity
        )

        print(
            "Soil:",
            soil_moisture
        )

        print(
            "Pump:",
            pump
        )

        print(
            "Window:",
            window
        )

        print(
            "----------------------------"
        )


        time.sleep(2)


    except Exception as e:

        print(
            "System Error:",
            e
        )

        time.sleep(2)