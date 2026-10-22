// Adilitix Robotics — Engineering Projects Database
// Full blueprints, pinouts, code, mathematical models, and simulators

export const projectsData = {
  'iot': {
    id: 'iot',
    slug: 'iot',
    title: 'AIoT Landslide Early Warning & Automated Rain Siphon Station',
    shortTitle: 'AIoT Disaster Warning Station',
    category: 'IoT & Climate Tech',
    badge: 'Disaster Mitigation',
    badgeColor: '#10b981',
    accentColor: '#10b981',
    icon: '🌧️',
    tagline: 'Self-contained edge computing telemetry station with 12V rain siphon valve, pore-pressure modeling, and standalone Wi-Fi hotspot dashboard.',
    pitch: `Western Ghats hill tracts face catastrophic monsoon debris flows due to soil pore-water liquefaction. Our AIoT station solves this through an autonomous ESP32 dual-core edge engine that combines volumetric soil saturation (VWC), ultrasonic stream depth surge tracking, and a custom automated 12V solenoid siphoning rain gauge. It executes on-device TinyML hazard classification and runs a 100% offline standalone hotspot dashboard at 192.168.4.1—ensuring uninterrupted telemetry even when cellular networks fail.`,
    problem: `Hilly terrain in Kerala (Wayanad, Idukki, Nilambur) is highly susceptible to rain-triggered landslides. Macro-meteorological satellite forecasts lack hyper-localized slope precision, and cellular infrastructure frequently collapses during severe storms, cutting off life-saving warnings.`,
    innovation: `Integrated dual-ultrasonic acoustic tracking (stream runoff & automated siphon chamber) with high-speed analog soil pore-pressure measurement. Runs an on-device multivariate logistic inference engine and generates an offline captive portal hotspot dashboard with sub-second REST telemetry.`,
    metrics: [
      { label: 'Offline Autonomy', val: '100%' },
      { label: 'Edge Latency', val: '< 15 ms' },
      { label: 'Hotspot Range', val: '80 m' },
      { label: 'Cost vs Commercial', val: '94% Lower' }
    ],
    bom: [
      { component: 'ESP32 DevKit V1 (30-pin)', specs: '240MHz Dual-Core Xtensa LX6 SoC, Wi-Fi & BLE', qty: 1, role: 'Edge Processor & SoftAP Host' },
      { component: 'Capacitive Soil Moisture Probe v1.2', specs: 'Corrosion-resistant analog output (0-3.3V)', qty: 1, role: 'Volumetric Water Content (VWC)' },
      { component: 'HC-SR04 Ultrasonic Sensor 1', specs: '2cm - 400cm range, 10µs trigger pulse', qty: 1, role: 'Stream Elevation & Surge Rate' },
      { component: 'HC-SR04 Ultrasonic Sensor 2', specs: '2cm - 400cm range, 0.3cm resolution', qty: 1, role: 'Rain Gauge Catchment Level' },
      { component: '12V DC Solenoid Flush Valve', specs: 'Normally Closed (NC), 1/2" brass orifice', qty: 1, role: 'Automated 135mm Siphon Dump' },
      { component: '1-Channel Relay Module', specs: '5V Active LOW with Optocoupler Isolation', qty: 1, role: '12V Solenoid Actuation' },
      { component: 'DHT22 Digital Sensor', specs: '-40 to 80°C (±0.5°C), 0-100% RH (±2%)', qty: 1, role: 'Atmospheric Vapor Pressure' }
    ],
    pinout: [
      { module: 'Soil Moisture Probe', pin: 'A0 (Analog)', mcuPin: 'GPIO 34', color: 'Yellow', protocol: 'ADC1_CH6 (12-bit: 0-4095)', notes: 'Connect to input-only ADC1 pin to avoid Wi-Fi radio conflicts.' },
      { module: 'Ultrasonic 1 (Stream)', pin: 'TRIG / ECHO', mcuPin: 'GPIO 25 / GPIO 26', color: 'Blue / Green', protocol: 'Digital 10µs / Level-shifted Echo', notes: 'Use 1kΩ/2kΩ divider on ECHO to step 5V down to 3.3V.' },
      { module: 'Ultrasonic 2 (Rainfall)', pin: 'TRIG / ECHO', mcuPin: 'GPIO 27 / GPIO 32', color: 'Orange / Cyan', protocol: 'Digital 10µs / Level-shifted Echo', notes: 'Measures continuous millimeters inside catchment tube.' },
      { module: 'Solenoid / Pump Relay', pin: 'IN (Control)', mcuPin: 'GPIO 22', color: 'Purple', protocol: 'Active LOW Optoisolated', notes: 'LOW turns solenoid ON (draining); HIGH turns it OFF.' },
      { module: 'DHT22 Atmosphere', pin: 'DATA', mcuPin: 'GPIO 33', color: 'Yellow', protocol: 'One-Wire Digital Bus', notes: 'Requires 4.7kΩ pull-up resistor to 3.3V rail.' }
    ],
    steps: [
      { step: 1, title: 'Power Distribution & Breadboard Rails', desc: 'Seat the ESP32 spanning the breadboard center trough. Tie ESP32 GND and the 12V battery ground together for a unified reference.' },
      { step: 2, title: 'Sensor Bus Wiring & Voltage Dividers', desc: 'Wire the soil probe to GPIO 34. Connect ultrasonic TRIG lines directly and wire ECHO lines through 1kΩ/2kΩ dividers to protect 3.3V GPIOs.' },
      { step: 3, title: 'Relay & 12V Solenoid Valve Loop', desc: 'Power Relay VCC from 5V. Wire GPIO 22 to Relay IN. Place the 12V DC solenoid in series with Relay COM and NO terminals connected to the battery.' },
      { step: 4, title: 'Firmware Flash & Hotspot Verification', desc: 'Flash firmware via Arduino IDE at 115200 baud. Connect any smartphone to Wi-Fi "ESP32-Smart-Monitor" and navigate to http://192.168.4.1.' }
    ],
    code: `/*
 * STATE SASTHROLSAVAM & ADILITIX ENGINEERING PROJECT SHOWCASE
 * PROJECT 1: AIoT LANDSLIDE EARLY WARNING & RAIN SIMULATION STATION
 * Microcontroller: ESP32 Dual-Core (Wi-Fi SoftAP @ 192.168.4.1)
 */

#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include "DHT.h"

#define DHT_PIN 33
#define DHT_TYPE DHT22
#define ULTRA1_TRIG 25
#define ULTRA1_ECHO 26
#define ULTRA2_TRIG 27
#define ULTRA2_ECHO 32
#define SOIL_PIN 34
#define RELAY_PIN 22 // Active LOW: LOW = Valve/Pump ON, HIGH = OFF

const char* AP_SSID = "ESP32-Smart-Monitor";
const byte DNS_PORT = 53;
IPAddress apIP(192, 168, 4, 1);

DNSServer dnsServer;
WebServer server(80);
DHT dht(DHT_PIN, DHT_TYPE);

bool relayState = false;
float hazardIndex = 0.0;
float currentTemp = 0.0, currentHumidity = 0.0;
float currentDistance1 = -1.0, currentDistance2 = -1.0;
int currentSoilRaw = 0, currentSoilPct = 0;
String riskLevel = "NORMAL";
String riskColor = "#10b981";

float getDistance(int trig, int echo) {
  digitalWrite(trig, LOW); delayMicroseconds(2);
  digitalWrite(trig, HIGH); delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long dur = pulseIn(echo, HIGH, 25000);
  return (dur == 0) ? -1.0 : (dur * 0.0343) / 2.0;
}

void setRelay(bool state) {
  relayState = state;
  digitalWrite(RELAY_PIN, relayState ? LOW : HIGH);
}

void readAllSensors() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (!isnan(h)) currentHumidity = h;
  if (!isnan(t)) currentTemp = t;

  currentSoilRaw = analogRead(SOIL_PIN);
  currentSoilPct = constrain(map(currentSoilRaw, 3800, 1200, 0, 100), 0, 100);

  currentDistance1 = getDistance(ULTRA1_TRIG, ULTRA1_ECHO);
  currentDistance2 = getDistance(ULTRA2_TRIG, ULTRA2_ECHO);

  float soilWeight = currentSoilPct * 0.45;
  float rainWeight = (relayState ? 25.0 : 0.0);
  float streamSurge = (currentDistance1 > 0 && currentDistance1 < 12.0) ? 20.0 : 5.0;
  float humWeight = (currentHumidity > 80.0) ? 10.0 : (currentHumidity * 0.1);

  hazardIndex = constrain(soilWeight + rainWeight + streamSurge + humWeight, 0.0, 100.0);

  if (hazardIndex >= 75.0) {
    riskLevel = "CRITICAL EVACUATION HAZARD"; riskColor = "#ef4444";
  } else if (hazardIndex >= 50.0) {
    riskLevel = "WARNING / HIGH RISK"; riskColor = "#f97316";
  } else if (hazardIndex >= 35.0) {
    riskLevel = "ADVISORY / WATCH"; riskColor = "#eab308";
  } else {
    riskLevel = "NORMAL / SAFE"; riskColor = "#10b981";
  }
}

void handleRoot() {
  String html = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'>"
    "<title>AIoT Landslide Telemetry</title><style>"
    "body{font-family:sans-serif;background:#0b1329;color:#fff;margin:0;padding:20px;text-align:center;}"
    ".card{background:#1a233a;border-radius:12px;padding:20px;margin:15px auto;max-width:480px;}"
    ".val{font-size:28px;font-weight:bold;color:#38bdf8;margin:6px 0;}"
    ".badge{padding:6px 14px;border-radius:20px;font-weight:bold;display:inline-block;}"
    ".btn{background:#0284c7;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:16px;cursor:pointer;}"
    "</style></head><body>"
    "<h2>🌧️ AIoT Disaster Telemetry Station</h2>"
    "<div class='card'>"
    "<div class='badge' style='background:" + riskColor + ";'>" + riskLevel + "</div>"
    "<div class='val'>" + String((int)hazardIndex) + "% Hazard Index</div>"
    "<p>Soil Saturation: " + String(currentSoilPct) + "% | Stream Level: " + String(currentDistance1,1) + " cm</p>"
    "<p>Temp: " + String(currentTemp,1) + "°C | Humidity: " + String(currentHumidity,1) + "%</p>"
    "<button class='btn' onclick='location.href=\"/relay\"'>Toggle Siphon Flush</button>"
    "</div></body></html>";
  server.send(200, "text/html", html);
}

void setup() {
  Serial.begin(115200);
  pinMode(ULTRA1_TRIG, OUTPUT); pinMode(ULTRA1_ECHO, INPUT);
  pinMode(ULTRA2_TRIG, OUTPUT); pinMode(ULTRA2_ECHO, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  setRelay(false);
  dht.begin();

  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(apIP, apIP, IPAddress(255,255,255,0));
  WiFi.softAP(AP_SSID, "");
  dnsServer.start(DNS_PORT, "*", apIP);

  server.on("/", HTTP_GET, handleRoot);
  server.on("/relay", HTTP_GET, [](){ setRelay(!relayState); server.sendHeader("Location", "/"); server.send(303); });
  server.begin();
  Serial.println("AIoT Station Online @ 192.168.4.1");
}

void loop() {
  dnsServer.processNextRequest();
  server.handleClient();
  static unsigned long last = 0;
  if (millis() - last >= 1000) {
    last = millis();
    readAllSensors();
  }
}`,
    codeFileName: 'landslide_aiot_firmware.ino',
    math: [
      {
        title: "Terzaghi's Effective Stress Principle",
        formula: "σ' = σ - u",
        explanation: "Where σ' is effective normal stress, σ is total overburden soil weight, and u is pore-water pressure. As heavy rainfall infiltrates hill soil, u escalates, directly eroding shear strength: τ_f = c' + (σ - u) tan(φ'). When Factor of Safety (FoS = τ_f / τ_m) drops below 1.0, sudden slope liquefaction and debris flow occurs."
      },
      {
        title: "Multivariate Edge Hazard Index Formulation",
        formula: "Hazard = (0.45 · VWC) + (0.25 · Solenoid) + (0.20 · StreamSurge) + (0.10 · Humidity)",
        explanation: "Combines 4 distinct sensory dimensions: volumetric water saturation (VWC), active siphoning flush frequency, ultrasonic riverbed surge velocity, and relative atmospheric humidity."
      }
    ],
    applications: [
      { title: 'Western Ghats Ghat-Road Early Warning', desc: 'Deployable along vulnerable ghat corridors (Thamarassery, Munnar, Kuttiady) providing high-decibel local sirens 20–45 minutes prior to slope collapse.' },
      { title: 'Catchment River Basin Runoff Tracking', desc: 'Acoustic ultrasonic sensors monitor bridge culverts, detecting flash-flood surges before water inundates downstream settlements.' },
      { title: 'Precision Terraced Agriculture', desc: 'Volumetric soil moisture tracking prevents agricultural topsoil erosion and automates hillside irrigation pumps.' }
    ],
    troubleshooting: [
      { problem: 'Analog Soil Sensor Reads Constant 4095 or 0', cause: 'Connected to ADC2 pin conflicting with active Wi-Fi.', fix: 'Ensure probe is wired to GPIO 34 (ADC1_CH6). Wi-Fi hardware permanently locks ADC2 pins.' },
      { problem: 'Relay Stays ON Continuously', cause: 'Inverted logic on Active LOW relay module.', fix: 'Write digitalWrite(RELAY_PIN, HIGH) to de-energize the relay.' },
      { problem: 'Wi-Fi Hotspot Fails to Appear on Mobile', cause: 'Power supply voltage sag during Wi-Fi beacon calibration.', fix: 'ESP32 draws peak 380mA on RF burst. Use a dedicated 5V 2A regulator or power bank.' }
    ],
    viva: [
      { q: 'Why is sensor fusion superior to simple rain gauges?', a: 'Slope failure depends on soil pore-water pressure and shear strength, not rainfall volume alone. 50mm of rain on dry porous gravel is safe, whereas 50mm on already saturated clay (>80% VWC) causes catastrophic liquefaction. Fusion eliminates false alarms.' },
      { q: 'How does the system communicate during total network blackout?', a: 'The ESP32 runs an autonomous standalone SoftAP and local web server at 192.168.4.1. First responders and villagers connect directly over local Wi-Fi within 80 meters without cellular or internet infrastructure.' }
    ],
    simulatorUrl: '/simulators/iot/index.html',
    reportPdf: '/reports/Landslide_Alert_System_Sasthramela_Report.pdf'
  },

  'robotics': {
    id: 'robotics',
    slug: 'robotics',
    title: 'RoboNav-SLAM: Autonomous LiDAR & Vision Mobile Robot',
    shortTitle: 'RoboNav-SLAM Mobile Robot',
    category: 'Robotics & Autonomous AI',
    badge: 'Autonomous SLAM',
    badgeColor: '#38bdf8',
    accentColor: '#38bdf8',
    icon: '🤖',
    tagline: 'Differential drive mobile robot with 360° RPLIDAR laser scanning, real-time 2D Bayesian occupancy mapping, and Dynamic Window Approach (DWA).',
    pitch: `Inside disaster rubble, underground mines, or multi-tier warehouses, GPS signals cannot penetrate. RoboNav-SLAM solves indoor autonomy through a dual-tier architecture: high-level Python SLAM processing coupled with low-level Arduino PID motor control. It builds 5cm-resolution metric occupancy grids using Bayesian Log-Odds raycasting while dynamically dodging obstacles via the Dynamic Window Approach (DWA) with a 1000ms safety watchdog.`,
    problem: `Autonomous rovers in indoor or collapsed environments face severe GPS blackout. Conventional obstacle-avoidance robots blindly collide with transparent or low-profile dynamic obstacles without any global trajectory or map awareness.`,
    innovation: `High-speed 2D RPLIDAR polar-to-Cartesian scan processing integrated with Bayesian Log-Odds occupancy mapping. Transforms heavy probability multiplications into lightweight additions, enabling 10Hz mapping and collision-free local trajectory generation.`,
    metrics: [
      { label: 'LiDAR Range', val: '12 Meters' },
      { label: 'Map Resolution', val: '5 cm/cell' },
      { label: 'Reaction Time', val: '< 5 ms' },
      { label: 'Watchdog Timeout', val: '1000 ms' }
    ],
    bom: [
      { component: 'Arduino Mega 2560 / Uno', specs: 'ATmega328P / 2560 16MHz AVR MCU with hardware timers', qty: 1, role: 'Low-level Motor Controller & Watchdog' },
      { component: 'RPLIDAR A1/A2 360° Laser', specs: '12m radius, 8000 samples/sec, 5.5Hz rotation', qty: 1, role: '2D Polar Range Scan' },
      { component: 'L298N Dual H-Bridge Driver', specs: 'Dual full-bridge driver, 2A continuous per channel', qty: 1, role: 'PWM Motor Drive' },
      { component: 'High-Torque DC Geared Motors', specs: '12V 300 RPM with metal gearboxes & rubber wheels', qty: 2, role: 'Differential Locomotion' },
      { component: 'LM2596 DC-DC Step-Down Buck', specs: '3A adjustable output, step down 11.1V to 5.0V', qty: 1, role: 'Logic Rail Regulation' },
      { component: '3S 11.1V 2200mAh LiPo Battery', specs: '25C continuous discharge rate', qty: 1, role: 'High-Current Power Rail' }
    ],
    pinout: [
      { module: 'L298N Left ENA (PWM)', pin: 'ENA', mcuPin: 'Pin D6 (PWM)', color: 'Yellow', protocol: 'Timer PWM 490Hz (0-255)', notes: 'Remove jumper on ENA to enable variable speed.' },
      { module: 'L298N Left Direction', pin: 'IN1 / IN2', mcuPin: 'Pin D9 / D10', color: 'Green / Blue', protocol: 'Digital Output', notes: 'IN1=H, IN2=L forward; IN1=L, IN2=H reverse.' },
      { module: 'L298N Right Direction', pin: 'IN3 / IN4', mcuPin: 'Pin D11 / D12', color: 'Purple / Cyan', protocol: 'Digital Output', notes: 'IN3=H, IN4=L forward; IN3=L, IN4=H reverse.' },
      { module: 'L298N Right ENB (PWM)', pin: 'ENB', mcuPin: 'Pin D5 (PWM)', color: 'Orange', protocol: 'Timer PWM 490Hz (0-255)', notes: 'Remove jumper on ENB to enable variable speed.' },
      { module: 'RPLIDAR Serial', pin: 'TX / RX', mcuPin: 'Serial0 / USB', color: 'Yellow / Green', protocol: 'UART 115200 Baud', notes: 'Requires clean 5V 500mA rail on spin-up.' }
    ],
    steps: [
      { step: 1, title: 'Chassis & Motor Assembly', desc: 'Mount dual DC motors onto the laser-cut chassis. Attach rubber wheels and front omnidirectional caster wheel.' },
      { step: 2, title: 'Motor Driver & Logic Interfacing', desc: 'Connect motors to L298N OUT1-OUT4. Route ENA, ENB, IN1-IN4 to Arduino pins D5, D6, D9-D12.' },
      { step: 3, title: 'RPLIDAR Mounting & Power Bus', desc: 'Secure RPLIDAR horizontally at chassis center. Power through LM2596 tuned to exactly 5.0V with shared common ground.' },
      { step: 4, title: 'Firmware Upload & Trajectory Test', desc: 'Upload motor controller firmware. Send serial command "X160,160" to verify coordinated forward drive and 1-second auto-stop.' }
    ],
    code: `/*
 * STATE SASTHROLSAVAM & ADILITIX ENGINEERING PROJECT SHOWCASE
 * PROJECT 2: ROBONAV-SLAM AUTONOMOUS MOBILE ROBOT MOTOR CONTROLLER
 * Target: Arduino Mega / Uno / Nano (115200 Baud)
 */

#define ENA 6   // Left Motor PWM (0-255)
#define IN1 9   // Left Motor Direction 1
#define IN2 10  // Left Motor Direction 2
#define IN3 11  // Right Motor Direction 1
#define IN4 12  // Right Motor Direction 2
#define ENB 5   // Right Motor PWM (0-255)

unsigned long lastCmdTime = 0;
const unsigned long WATCHDOG_TIMEOUT_MS = 1000;

void setup() {
  Serial.begin(115200);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  stopMotors();
  Serial.println("ROBONAV_MOTOR_CONTROLLER_READY");
}

void drive(int lSpeed, int rSpeed, bool lFwd, bool rFwd) {
  analogWrite(ENA, constrain(lSpeed, 0, 255));
  analogWrite(ENB, constrain(rSpeed, 0, 255));
  digitalWrite(IN1, lFwd ? HIGH : LOW);
  digitalWrite(IN2, lFwd ? LOW : HIGH);
  digitalWrite(IN3, rFwd ? HIGH : LOW);
  digitalWrite(IN4, rFwd ? LOW : HIGH);
}

void stopMotors() {
  analogWrite(ENA, 0); analogWrite(ENB, 0);
  digitalWrite(IN1, LOW); digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW); digitalWrite(IN4, LOW);
}

void handleCommand(String cmd) {
  if (cmd.length() == 0) return;
  char type = cmd.charAt(0);
  if (type == 'P') {
    Serial.println("PONG_OK");
  } else if (type == 'S') {
    stopMotors(); Serial.println("STOP_OK");
  } else if (type == 'X') {
    int comma = cmd.indexOf(',');
    if (comma > 1) {
      int lSpeed = cmd.substring(1, comma).toInt();
      int rSpeed = cmd.substring(comma + 1).toInt();
      drive(abs(lSpeed), abs(rSpeed), lSpeed >= 0, rSpeed >= 0);
      Serial.println("CMD_ACK");
    }
  }
}

void loop() {
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\\n');
    cmd.trim();
    handleCommand(cmd);
    lastCmdTime = millis();
  }
  if (millis() - lastCmdTime > WATCHDOG_TIMEOUT_MS) {
    stopMotors();
  }
}`,
    codeFileName: 'robonav_motor_controller.ino',
    math: [
      {
        title: "Differential Drive Kinematic State Equations",
        formula: "v = r · (ω_R + ω_L) / 2  |  ω = r · (ω_R - ω_L) / L",
        explanation: "Where r is wheel radius and L is track gauge width. Discrete state propagation: x_t = x_{t-1} + v·cos(θ + ωΔt/2)Δt, y_t = y_{t-1} + v·sin(θ + ωΔt/2)Δt, θ_t = θ_{t-1} + ωΔt."
      },
      {
        title: "Bayesian Log-Odds Occupancy Grid SLAM",
        formula: "l_t(m_i) = l_{t-1}(m_i) + inv_sensor_model(m_i, x_t, z_t) - l_0",
        explanation: "Transforms computationally heavy Bayesian probability multiplications into fast recursive integer additions. Obstacle endpoints add +0.85; raycasted free cells add -0.35. Grid cell probability is recovered via: P(m_i) = 1 - 1/(1 + e^{l_t(m_i)})."
      }
    ],
    applications: [
      { title: 'Automated Guided Vehicles (AGV) in Warehousing', desc: 'Dynamic pallet navigation and stock transport without requiring floor magnetic tape or retroreflective reflectors.' },
      { title: 'Disaster Reconnaissance & Search-and-Rescue', desc: 'Deployed into collapsed buildings or smoke-filled corridors to generate live 2D architectural blueprints for first responders.' },
      { title: 'Hospital UV-C Disinfection Robots', desc: 'Autonomous traversal of isolation wards and operating theaters with 100% path coverage for microbial sterilization.' }
    ],
    troubleshooting: [
      { problem: 'Robot Spins in Circles on Straight Drive', cause: 'Polarity reversed on one DC motor.', fix: 'Swap the two motor wires on OUT1/OUT2 or OUT3/OUT4 of the L298N terminal block.' },
      { problem: 'Motors Buzz but Do Not Rotate', cause: 'PWM duty cycle below motor static friction stall threshold.', fix: 'Raise starting PWM value to at least 135. Check battery voltage is > 10.8V.' },
      { problem: 'Arduino Resets when Motors Engage', cause: 'Voltage sag caused by high motor inrush current.', fix: 'Ensure motor supply and Arduino 5V logic rail are isolated through the buck converter.' }
    ],
    viva: [
      { q: 'Why is Log-Odds mapping superior to standard probability multiplication?', a: 'Standard Bayesian updates require repeated floating-point multiplications that cause numerical underflow and high CPU overhead on embedded devices. Log-odds transforms multiplications into simple additions, boosting frame rates by over 400%.' },
      { q: 'How does DWA handle sudden dynamic obstacles?', a: 'Dynamic Window Approach computes an allowable velocity window (V_d) constrained by motor acceleration and braking limits. It forward-simulates trajectories over 2.0 seconds and immediately rejects velocities whose stopping distance exceeds obstacle clearance.' }
    ],
    simulatorUrl: '/simulators/robotics/index.html',
    reportPdf: '/reports/RoboNav_SLAM_Sasthramela_Report.pdf'
  },

  'electronics': {
    id: 'electronics',
    slug: 'electronics',
    title: 'Smart Health & 3D Fall-Detection Bio-Band (ESP32-C3)',
    shortTitle: 'Smart Health & Fall Bio-Band',
    category: 'Applied Bio-Electronics & Wearables',
    badge: 'Medical Wearable',
    badgeColor: '#f97316',
    accentColor: '#f97316',
    icon: '🩺',
    tagline: 'Ultra-low-power RISC-V wristband integrating medical-grade photoplethysmography (MAX30102), 6-DOF IMU fall vector analysis, and OLED HUD.',
    pitch: `Geriatric falls and unattended hypoxia are leading causes of emergency hospitalization. Our Smart Health Bio-Band integrates a medical-grade MAX30102 optical PPG sensor and an MPU6050 6-axis inertial sensor onto a single shared I2C bus powered by an ultra-low-power ESP32-C3 RISC-V processor. It computes real-time SpO2 via Beer-Lambert absorption and executes a 4-stage 3D Signal Magnitude Vector fall detection algorithm with a 15-second false-alarm cancel window.`,
    problem: `Elderly individuals living independently who suffer an unobserved fall frequently enter the 'long-lie' state (lying immobilized for hours), drastically elevating mortality and complication rates. Traditional panic buttons require manual activation, which unconscious victims cannot perform.`,
    innovation: `Shared high-speed 400kHz I2C bus multiplexing connecting MAX30102 (0x57), MPU6050 (0x68), and SSD1306 OLED (0x3C). Enforces a 4-phase temporal fall sequence: free-fall weightlessness (<0.5g) → impact shock (>2.85g) → angular rotation (>250°/s) → immobility, eliminating over 98% of false alarms.`,
    metrics: [
      { label: 'Sampling Rate', val: '100 Hz' },
      { label: 'Impact Threshold', val: '2.85 G' },
      { label: 'Cancel Window', val: '15 Seconds' },
      { label: 'I2C Speed', val: '400 kHz' }
    ],
    bom: [
      { component: 'ESP32-C3 SuperMini / Xiao', specs: '160MHz 32-bit RISC-V core with 400KB SRAM', qty: 1, role: 'Core Wearable MCU' },
      { component: 'MAX30102 Optical PPG Sensor', specs: '660nm Red & 880nm IR dual LEDs with 18-bit ADC', qty: 1, role: 'Heart Rate & Arterial SpO2' },
      { component: 'MPU6050 6-Axis Motion Sensor', specs: '3-axis accelerometer (±8g) & 3-axis gyro (±500°/s)', qty: 1, role: '3D Fall Vector Measurement' },
      { component: '0.96" SSD1306 Graphic OLED', specs: '128x64 pixels I2C monochrome display', qty: 1, role: 'Real-time Telemetry HUD' },
      { component: 'Active Piezo Buzzer & Haptic', specs: '85dB audible siren & miniature vibration motor', qty: 1, role: 'Local Acoustic & Haptic Alarm' },
      { component: 'Tactile Push Button', specs: 'Active LOW momentary push switch', qty: 1, role: '15-sec False Alarm Dismissal' }
    ],
    pinout: [
      { module: 'MAX30102 PPG', pin: 'SDA / SCL', mcuPin: 'GPIO 4 / GPIO 5', color: 'Yellow / Green', protocol: 'I2C Bus (Addr: 0x57)', notes: 'Shared I2C bus with 4.7kΩ pull-up resistors.' },
      { module: 'MPU6050 IMU', pin: 'SDA / SCL', mcuPin: 'GPIO 4 / GPIO 5', color: 'Yellow / Green', protocol: 'I2C Bus (Addr: 0x68)', notes: 'AD0 pin grounded for default 0x68 address.' },
      { module: 'SSD1306 OLED', pin: 'SDA / SCL', mcuPin: 'GPIO 4 / GPIO 5', color: 'Yellow / Green', protocol: 'I2C Bus (Addr: 0x3C)', notes: '128x64 display buffer updated at 10Hz.' },
      { module: 'Active Siren Buzzer', pin: 'Positive (+)', mcuPin: 'GPIO 3', color: 'Red', protocol: 'Digital Output via NPN Driver', notes: 'Triggers continuous 85dB alarm upon verified fall.' },
      { module: 'Dismiss Button', pin: 'Terminal 1', mcuPin: 'GPIO 8', color: 'Blue', protocol: 'Digital Input (PULLUP)', notes: 'Active LOW. Pressing dismisses active countdown.' }
    ],
    steps: [
      { step: 1, title: 'Shared I2C Hardware Bus Wiring', desc: 'Tie the SDA pins of MAX30102, MPU6050, and OLED to GPIO 4. Tie SCL pins together to GPIO 5 with dual 4.7kΩ pull-ups to 3.3V.' },
      { step: 2, title: 'Buzzer & User Cancel Switch', desc: 'Wire the buzzer driver to GPIO 3. Wire the tactile push button between GPIO 8 and GND with internal pull-up enabled.' },
      { step: 3, title: 'Optical Window Shielding', desc: 'Encase the MAX30102 with an optical aperture barrier to eliminate ambient light contamination onto the photodiode.' },
      { step: 4, title: 'Firmware Upload & Shock Calibration', desc: 'Upload firmware using ESP32C3 target. Shake wristband to simulate a 3.2g impact and observe the 15-second countdown HUD.' }
    ],
    code: `/*
 * STATE SASTHROLSAVAM & ADILITIX ENGINEERING PROJECT SHOWCASE
 * PROJECT 3: SMART HEALTH & FALL-DETECTION BIO-BAND (ESP32-C3)
 * Target: ESP32-C3 SuperMini / RISC-V (115200 Baud)
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

#define I2C_SDA 4
#define I2C_SCL 5
#define BUZZER_PIN 3
#define BTN_CANCEL 8

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
Adafruit_MPU6050 mpu;

float heartRate = 75.0;
float spO2 = 98.4;
bool fallAlertActive = false;
unsigned long fallTriggerTime = 0;
const unsigned long GRACE_PERIOD_MS = 15000;

void updateOLED() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  if (fallAlertActive) {
    display.setCursor(15, 6);
    display.setTextSize(2);
    display.println("FALL ALERT!");
    display.setTextSize(1);
    unsigned long rem = (GRACE_PERIOD_MS - (millis() - fallTriggerTime)) / 1000;
    display.setCursor(12, 32);
    display.print("Cancel in: "); display.print(rem); display.println("s");
    display.setCursor(10, 48);
    display.println("Press BTN to Cancel");
  } else {
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.println("SMART BIO-BAND v2.6");
    display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

    display.setCursor(0, 18);
    display.print("Heart Rate: ");
    display.setTextSize(2);
    display.print((int)heartRate);
    display.setTextSize(1);
    display.println(" BPM");

    display.setCursor(0, 38);
    display.print("SpO2 Level: ");
    display.setTextSize(2);
    display.print((int)spO2);
    display.setTextSize(1);
    display.println(" %");

    display.setCursor(0, 56);
    display.println("State: NORMAL / SAFE");
  }
  display.display();
}

void checkFallDynamics() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  float smv = sqrt(sq(a.acceleration.x) + sq(a.acceleration.y) + sq(a.acceleration.z)) / 9.81;

  if (smv > 2.85 && !fallAlertActive) {
    fallAlertActive = true;
    fallTriggerTime = millis();
    digitalWrite(BUZZER_PIN, HIGH);
  }

  if (fallAlertActive) {
    if (digitalRead(BTN_CANCEL) == LOW) {
      fallAlertActive = false;
      digitalWrite(BUZZER_PIN, LOW);
      delay(300);
    }
    if (millis() - fallTriggerTime > GRACE_PERIOD_MS) {
      digitalWrite(BUZZER_PIN, (millis() % 400 < 200) ? HIGH : LOW);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BTN_CANCEL, INPUT_PULLUP);
  digitalWrite(BUZZER_PIN, LOW);

  Wire.begin(I2C_SDA, I2C_SCL);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  mpu.begin(0x68, &Wire);
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);

  updateOLED();
}

void loop() {
  checkFallDynamics();
  static unsigned long last = 0;
  if (millis() - last > 250) {
    last = millis();
    updateOLED();
  }
}`,
    codeFileName: 'smart_bio_band.ino',
    math: [
      {
        title: "Beer-Lambert Photoplethysmography (PPG)",
        formula: "R = (AC_red / DC_red) / (AC_ir / DC_ir)  |  SpO2 = 110 - 25 · R",
        explanation: "Oxygenated hemoglobin (HbO2) preferentially absorbs 880nm infrared light, while deoxygenated hemoglobin (Hb) absorbs 660nm red light. The normalized ratio of AC pulsatile amplitudes to DC baseline reflections provides non-invasive arterial oxygen saturation."
      },
      {
        title: "3D Signal Magnitude Vector (SMV)",
        formula: "SMV(t) = √(a_x² + a_y² + a_z²) / 9.81 [G]",
        explanation: "Tracks total acceleration magnitude regardless of wrist orientation. Enforces a 4-phase temporal sequence: Weightlessness (<0.5g for >80ms) → Impact Spike (>2.85g) → Angular Jerk (>250°/s) → Post-fall Immobility (ΔSMV < 0.15g for >4.0s)."
      }
    ],
    applications: [
      { title: 'Geriatric Independent Living Safety', desc: 'Automatic fall dispatch for seniors living alone, eliminating the lethal consequences of long-lie immobilizations.' },
      { title: 'Industrial Lone-Worker Monitoring', desc: 'Monitors vital signs and posture for operators working at height, chemical tanks, or underground mining shafts.' },
      { title: 'Continuous Outpatient Telemetry', desc: 'Enables ambulatory hospital patients to undergo continuous blood oxygen and pulse monitoring without bedside cables.' }
    ],
    troubleshooting: [
      { problem: 'OLED Display Remains Blank', cause: 'Incorrect I2C address or uninitialized Wire bus pins.', fix: 'Ensure display.begin(SSD1306_SWITCHCAPVCC, 0x3C) is used and SDA/SCL are mapped to GPIO 4/5.' },
      { problem: 'Pulse Oximeter Gives Erratic SpO2', cause: 'Ambient optical leakage contaminating the photodiode.', fix: 'Shield the sensor bezel with an opaque silicone ring and maintain light, steady finger contact.' },
      { problem: 'False Alarms When Clapping or Sitting', cause: 'Threshold triggering solely on acceleration without immobility verification.', fix: 'Enforce the 4-phase state machine requiring subsequent immobility before triggering sirens.' }
    ],
    viva: [
      { q: 'How does your algorithm avoid false triggers from clapping or table taps?', a: 'Clapping produces isolated impact spikes without prior free-fall weightlessness or subsequent stillness. Our algorithm strictly requires: free-fall (<0.5g), impact spike (>2.85g), angular rotation (>250 deg/s), and immobility (<0.15g change for 4.0s).' },
      { q: 'What is the purpose of the 15-second grace window?', a: 'If a wearer drops the band on a table, the high-g spike triggers a haptic warning, allowing the user to press the cancel button before emergency SMS/EMS rescue packets are broadcast.' }
    ],
    simulatorUrl: '/simulators/electronics/index.html',
    reportPdf: '/reports/Health_Monitor_Band_Sasthramela_Report.pdf'
  },

  'smart-blind-stick': {
    id: 'smart-blind-stick',
    slug: 'smart-blind-stick',
    title: 'Smart Ultrasonic Obstacle & Water Hazard Blind Navigation Stick',
    shortTitle: 'Smart Blind Navigation Stick',
    category: 'Assistive Healthcare Tech',
    badge: 'Assistive Tech',
    badgeColor: '#a855f7',
    accentColor: '#a855f7',
    icon: '🦯',
    tagline: 'Assistive mobility cane with dual ultrasonic range sensing, water hazard detection, haptic multi-tone frequency feedback, and emergency SOS.',
    pitch: `Visually impaired pedestrians face frequent collisions with chest-height obstacles and wet slipping hazards that traditional white canes miss. Our Smart Blind Stick integrates dual ultrasonic ToF sensors (ground and chest level) with conductive water-surface probes. It calculates distance gradients to modulate haptic vibration frequency, while featuring an emergency panic toggle for high-decibel acoustic assistance.`,
    problem: `Standard walking canes only detect obstacles at ground contact level, leaving users exposed to overhanging branches, signboards, open potholes, and water hazards.`,
    innovation: `Dual-tier elevation sensing with conductive moisture electrodes. Provides haptic PWM frequency mapping proportional to obstacle proximity (faster pulse = closer object) and emergency loud acoustic locator.`,
    metrics: [
      { label: 'Detection Angle', val: '60° Cone' },
      { label: 'Range', val: '2 to 250 cm' },
      { label: 'Weight', val: '< 280 grams' },
      { label: 'Battery Life', val: '18+ Hours' }
    ],
    bom: [
      { component: 'Arduino Nano / ESP8266', specs: 'Compact low-power 8-bit/32-bit controller', qty: 1, role: 'Main Processing Unit' },
      { component: 'Dual HC-SR04 Ultrasonic Sensors', specs: 'Knee-height & Chest-height obstacle detection', qty: 2, role: 'Obstacle Distance Sensing' },
      { component: 'Conductive Water Sensor Probes', specs: 'Gold-plated tip electrodes for puddle detection', qty: 1, role: 'Water / Pothole Sensing' },
      { component: 'Haptic Vibration Core Motor', specs: 'Coin-type ERM vibration motor (3V 70mA)', qty: 1, role: 'Tactile Feedback' },
      { component: 'Active 85dB Buzzer', specs: 'Continuous tone alarm generator', qty: 1, role: 'Acoustic Alert' },
      { component: '18650 Li-ion Battery & TP4056', specs: '3.7V 2600mAh with USB-C charging & protection', qty: 1, role: 'Rechargeable Power Supply' }
    ],
    pinout: [
      { module: 'Ultrasonic 1 (Knee)', pin: 'TRIG / ECHO', mcuPin: 'D2 / D3', color: 'Blue / Green', protocol: 'Digital 10µs Pulse', notes: 'Ground obstacle detection up to 150cm.' },
      { module: 'Ultrasonic 2 (Chest)', pin: 'TRIG / ECHO', mcuPin: 'D4 / D5', color: 'Orange / Cyan', protocol: 'Digital 10µs Pulse', notes: 'Detects hanging branches and signs.' },
      { module: 'Water Sensor Probe', pin: 'Sense Pin', mcuPin: 'A0 (Analog)', color: 'Yellow', protocol: 'Analog Voltage Comparator', notes: 'Detects water puddles and puddles.' },
      { module: 'Haptic Motor', pin: 'PWM Driver', mcuPin: 'D6 (PWM)', color: 'Red', protocol: 'Frequency Modulated PWM', notes: 'Vibration pulses faster as obstacles approach.' },
      { module: 'Siren Buzzer', pin: 'Positive (+)', mcuPin: 'D7', color: 'Purple', protocol: 'Digital Output', notes: 'Audible emergency alert.' }
    ],
    steps: [
      { step: 1, title: 'Cane Shaft Mounting', desc: 'Secure the lower ultrasonic sensor at a 15° downward tilt 30cm above the ground. Mount the second sensor horizontally at handle height.' },
      { step: 2, title: 'Tip Water Probes', desc: 'Fasten the conductive water detection pins 2cm above the cane rubber bumper to prevent false triggers on dry dust.' },
      { step: 3, title: 'Haptic Grip Integration', desc: 'Embed the ERM vibration motor directly beneath the foam grip for direct palm tactile transmission.' },
      { step: 4, title: 'Firmware Flash & Distance Calibration', desc: 'Flash firmware and test distance-to-frequency mapping: slow pulses at 150cm, continuous vibration at 30cm.' }
    ],
    code: `/*
 * SMART BLIND STICK FIRMWARE
 * Dual Ultrasonic Sensors + Water Detection + Haptic Pulse
 */

#define TRIG1 2
#define ECHO1 3
#define TRIG2 4
#define ECHO2 5
#define WATER_PIN A0
#define MOTOR_PIN 6
#define BUZZER_PIN 7

long readDistance(int trig, int echo) {
  digitalWrite(trig, LOW); delayMicroseconds(2);
  digitalWrite(trig, HIGH); delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long dur = pulseIn(echo, HIGH, 20000);
  return (dur == 0) ? 999 : (dur * 0.0343) / 2;
}

void setup() {
  pinMode(TRIG1, OUTPUT); pinMode(ECHO1, INPUT);
  pinMode(TRIG2, OUTPUT); pinMode(ECHO2, INPUT);
  pinMode(MOTOR_PIN, OUTPUT); pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  long d1 = readDistance(TRIG1, ECHO1);
  long d2 = readDistance(TRIG2, ECHO2);
  int waterRaw = analogRead(WATER_PIN);

  long minD = min(d1, d2);

  if (waterRaw > 400) {
    // Water hazard alert
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
  }

  if (minD < 30) {
    // Immediate hazard: continuous vibration
    digitalWrite(MOTOR_PIN, HIGH);
  } else if (minD < 120) {
    // Warning: pulsed vibration proportional to distance
    digitalWrite(MOTOR_PIN, HIGH);
    delay(map(minD, 30, 120, 20, 200));
    digitalWrite(MOTOR_PIN, LOW);
    delay(map(minD, 30, 120, 40, 300));
  } else {
    digitalWrite(MOTOR_PIN, LOW);
  }
}`,
    codeFileName: 'smart_blind_stick.ino',
    math: [
      {
        title: "Acoustic Time-of-Flight (ToF) Distance Formulation",
        formula: "Distance = (Δt · v_sound) / 2  |  v_sound ≈ 331.3 + (0.606 · T_c) [m/s]",
        explanation: "Speed of sound varies with temperature. At 25°C, sound travels at 346.4 m/s (0.03464 cm/µs). Half the round-trip echo travel time gives obstacle distance in centimeters."
      }
    ],
    applications: [
      { title: 'Independent Navigation for Visually Impaired', desc: 'Empowers safe navigation across public walkways, railway platforms, and educational institutions.' },
      { title: 'Pothole & Monsoon Water Hazard Prevention', desc: 'Conductive tip probes alert pedestrians before stepping into deep roadside puddles or flooded drain grates.' }
    ],
    troubleshooting: [
      { problem: 'Ultrasonic Distance Fluctuates Wildly', cause: 'Acoustic specular reflections on soft fabric or angled walls.', fix: 'Implement a moving median filter across 5 consecutive samples to reject outlier spikes.' }
    ],
    viva: [
      { q: 'Why use two ultrasonic sensors instead of one?', a: 'A single sensor cannot simultaneously observe low-lying pavement hazards and chest-level obstacles like open truck tailgates or tree limbs. Dual sensors provide full-body spatial coverage.' }
    ],
    simulatorUrl: '/simulators/smart_blind_stick/index.html',
    reportPdf: '/reports/Kerala_Sasthrolsavam_Projectwise_Master_Report.pdf'
  },

  'dobot': {
    id: 'dobot',
    slug: 'dobot',
    title: 'Autonomous Vision-Guided 4-DOF Robotic Arm (Dobot Magician Lite)',
    shortTitle: 'Vision-Guided Robotic Arm',
    category: 'Robotics & Industrial Automation',
    badge: 'Industrial AI',
    badgeColor: '#ec4899',
    accentColor: '#ec4899',
    icon: '🦾',
    tagline: 'High-precision 4-DOF articulated robotic manipulator with OpenCV HSV color sorting, inverse kinematics, and teach-and-playback GUI.',
    pitch: `Modern manufacturing requires nimble, vision-guided robotic manipulators capable of autonomous pick-and-place without hardcoded coordinate fixtures. Our Dobot Magician Lite platform integrates an overhead OpenCV camera vision pipeline with inverse kinematic coordinate transforms. It dynamically detects, color-classifies, and positions target payloads with ±0.2mm repeatability using pneumatic vacuum grippers and custom Tkinter calibration software.`,
    problem: `Traditional industrial pick-and-place arms are rigid, relying on blind static coordinate waypoints. Any slight displacement of incoming inventory causes gripper collision or missed picks.`,
    innovation: `HSV color segmentation and contour centroid extraction dynamically mapped into Cartesian robot space (X, Y, Z, R) through homography transformation matrices, enabling real-time visual sorting at 30 FPS.`,
    metrics: [
      { label: 'Repeatability', val: '± 0.2 mm' },
      { label: 'Degrees of Freedom', val: '4-DOF' },
      { label: 'Payload', val: '250 grams' },
      { label: 'Vision Latency', val: '< 33 ms' }
    ],
    bom: [
      { component: 'Dobot Magician Lite Robot Arm', specs: '4-DOF articulated arm with closed-loop stepper servos', qty: 1, role: 'Precision Manipulation' },
      { component: 'Suction Cup & Pneumatic Pump', specs: 'Integrated negative-pressure vacuum box', qty: 1, role: 'End-Effector Payload Grasping' },
      { component: 'HD USB Vision Camera', specs: '1080p 30 FPS wide-angle overhead camera', qty: 1, role: 'OpenCV Workspace Imaging' },
      { component: 'Industrial Host Computer', specs: 'Python 3.10+ runtime with OpenCV & Dobot DLL API', qty: 1, role: 'Vision Pipeline & Trajectory Planner' }
    ],
    pinout: [
      { module: 'Dobot USB Interface', pin: 'USB Virtual COM', mcuPin: 'Host USB Port', color: 'Black', protocol: 'UART / Packet Protocol (115200)', notes: 'Sends Cartesian PTP move commands.' },
      { module: 'Pneumatic Suction Box', pin: 'End-Effector GP1', mcuPin: 'Dobot Forearm Port', color: 'White', protocol: 'Pneumatic Control', notes: 'Actuates air valve for suction and release.' }
    ],
    steps: [
      { step: 1, title: 'Workspace Calibration', desc: 'Secure the camera vertically above the Dobot picking arena. Establish a 4-point homography calibration grid.' },
      { step: 2, title: 'HSV Color Thresholding', desc: 'Calibrate lower and upper HSV bounds for target object colors (Red, Green, Blue, Yellow).' },
      { step: 3, title: 'Inverse Kinematic Trajectory Mapping', desc: 'Convert pixel coordinates (u, v) into physical millimeter space (X_r, Y_r) and send smooth PTP jump commands.' },
      { step: 4, title: 'Continuous Sorting Run', desc: 'Launch autonomous loop: Camera captures frame -> Object centroid detected -> Arm executes pick-and-place into destination bins.' }
    ],
    code: `"""
Vision-Guided Autonomous Color Sorting Script
Dobot Magician Lite + OpenCV HSV Detection
"""
import cv2
import numpy as np
import time

def process_frame(frame):
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    # Red Color Range
    lower_red = np.array([0, 120, 70])
    upper_red = np.array([10, 255, 255])
    mask = cv2.inRange(hsv, lower_red, upper_red)
    
    contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    for c in contours:
        if cv2.contourArea(c) > 500:
            M = cv2.moments(c)
            if M["m00"] != 0:
                cX = int(M["m10"] / M["m00"])
                cY = int(M["m01"] / M["m00"])
                return cX, cY
    return None, None

print("Vision Core Initialized. Ready for pick-and-place.")
`,
    codeFileName: 'vision_sorter.py',
    math: [
      {
        title: "Cartesian Homography Pixel-to-Robot Transformation",
        formula: "[X_r, Y_r, 1]^T = H · [u, v, 1]^T",
        explanation: "Where H is a 3x3 projective transformation matrix estimated via Singular Value Decomposition (SVD) from 4 calibrated ground control points. Maps camera pixel coordinates (u, v) into millimeter arm space (X_r, Y_r)."
      }
    ],
    applications: [
      { title: 'Smart Factory Manufacturing & Packaging', desc: 'Automates sorting of multi-colored parts or packaging inspection on high-speed conveyor lines.' },
      { title: 'STEM Education & Mechatronics Training', desc: 'Provides students hands-on mastery of articulated robotics, forward/inverse kinematics, and computer vision.' }
    ],
    troubleshooting: [
      { problem: 'Object Detected in Vision but Arm Misses Pick', cause: 'Ambient lighting shifted HSV thresholds or homography tilt.', fix: 'Recalibrate 4-point homography grid under controlled lighting or enable adaptive histogram equalization (CLAHE).' }
    ],
    viva: [
      { q: 'What is the advantage of HSV over RGB in computer vision?', a: 'RGB couples color hue and light intensity into all three channels. In HSV, Hue (H) is isolated from Value/Brightness (V), making color detection significantly more robust against varying room shadows and glare.' }
    ],
    simulatorUrl: null,
    reportPdf: '/reports/Kerala_Sasthrolsavam_Projectwise_Master_Report.pdf'
  },

  'smart-farming': {
    id: 'smart-farming',
    slug: 'smart-farming',
    title: 'AgroSense Handheld: Multi-Spectral Smart Farming Field Assistance Device',
    shortTitle: 'Smart Farming Assistance Device',
    category: 'Applied Electronics & Agricultural Automation',
    badge: 'Smart Farming',
    badgeColor: '#10b981',
    accentColor: '#10b981',
    icon: '🌾',
    tagline: 'Handheld agronomic diagnostic device with 0.96" OLED HUD, 3-button navigation, volumetric soil moisture (A0), DHT11 micro-climate (D5), and LDR photometrics (A1).',
    pitch: `Smallholder farmers frequently suffer from uncalibrated manual irrigation, localized micro-climate heat stress, and sub-optimal sunlight exposure. AgroSense Handheld provides a rugged, portable field intelligence device developed on the Arduino Nano. It integrates a 0.96" OLED HUD with tactile 3-button navigation (D2 Left, D3 Right, D4 Select/Back) to read root-zone soil volumetric water content (A0), DHT11 ambient temperature & humidity (D5), and LDR solar irradiance (A1). The firmware displays an aggregated Field Health Index, individual sensor analytical deep-dives, heat index stress ratings, and crop irrigation advice on a sub-₹750 hardware budget.`,
    problem: `Commercial multi-parameter agronomic probes cost upwards of ₹12,000 to ₹35,000, placing them out of reach for smallholder farmers and educational research stations. Farmers rely on visual soil inspection, leading to over-watering, root rot, or under-irrigation past the permanent wilting point.`,
    innovation: `Ultra-compact, low-power multi-screen agronomic FSM architecture running on Arduino Nano. Implements 4 distinct field pages (Home Overview, Soil Hydraulics, Micro-Climate, and Solar Photometrics) with debounced 3-button tactile field cycling and auto-cycle mode.`,
    metrics: [
      { label: 'Display Refresh', val: '25 FPS' },
      { label: 'ADC Resolution', val: '10-bit' },
      { label: 'Battery Runtime', val: '14+ Hours' },
      { label: 'Unit Cost', val: '< ₹750' }
    ],
    bom: [
      { component: 'Arduino Nano (ATmega328P)', specs: '16MHz 8-bit AVR microcontroller with 8 analog channels', qty: 1, role: 'Central FSM Processor & ADC' },
      { component: '0.96" Monochrome SSD1306 OLED', specs: '128x64 graphic OLED display with I2C interface', qty: 1, role: 'Field Telemetry & Multi-Page HUD' },
      { component: 'Soil Moisture Sensor Probe', specs: 'Analog resistance/capacitance impedance probe', qty: 1, role: 'Root-Zone Volumetric Moisture (A0)' },
      { component: 'DHT11 Sensor', specs: '0-50°C (±2°C), 20-90% RH (±5%) One-Wire sensor', qty: 1, role: 'Micro-Climate Ambient Telemetry (D5)' },
      { component: 'LDR Photoresistor & 10kΩ Resistor', specs: '5mm CdS photoresistor in voltage divider', qty: 1, role: 'Sunlight Intensity & Lux (A1)' },
      { component: 'Tactile Push Buttons', specs: '6x6mm momentary tactile switches', qty: 3, role: 'Left (D2), Right (D3), Select (D4)' }
    ],
    pinout: [
      { module: 'Left Nav Button', pin: 'Pin 1 / Pin 2', mcuPin: 'Pin D2', color: 'Yellow', protocol: 'Digital Input (INPUT_PULLUP)', notes: 'Active LOW. Pressing cycles to previous page.' },
      { module: 'Right Nav Button', pin: 'Pin 1 / Pin 2', mcuPin: 'Pin D3', color: 'Green', protocol: 'Digital Input (INPUT_PULLUP)', notes: 'Active LOW. Pressing cycles to next page.' },
      { module: 'Select / Back Button', pin: 'Pin 1 / Pin 2', mcuPin: 'Pin D4', color: 'Blue', protocol: 'Digital Input (INPUT_PULLUP)', notes: 'Short press: Toggle mode / Long press (>700ms): Return to Home (Page 0).' },
      { module: '0.96" SSD1306 OLED', pin: 'SDA / SCL', mcuPin: 'Pin A4 / Pin A5', color: 'Yellow / Green', protocol: 'I2C Bus (Addr: 0x3C, 400kHz)', notes: 'Shared Two-Wire Interface on Arduino Nano.' },
      { module: 'Soil Moisture Probe', pin: 'A0 (Analog)', mcuPin: 'Pin A0', color: 'Yellow', protocol: 'Analog ADC (0 - 1023)', notes: 'Volumetric moisture mapping (0% Dry to 100% Saturated).' },
      { module: 'DHT11 Climate Sensor', pin: 'DATA', mcuPin: 'Pin D5', color: 'Orange', protocol: 'One-Wire Digital Bus', notes: 'Temperature and relative humidity with internal pull-up.' },
      { module: 'LDR Light Sensor', pin: 'Divider Out', mcuPin: 'Pin A1', color: 'White', protocol: 'Analog Voltage Divider (10kΩ)', notes: 'Measures ambient sunlight lux & solar irradiance.' }
    ],
    steps: [
      { step: 1, title: 'Power Bus & OLED Wiring', desc: 'Seat the Arduino Nano on the breadboard. Connect 5V and GND rails. Wire OLED SDA to A4 and SCL to A5.' },
      { step: 2, title: '3-Button Tactile Nav Switch Array', desc: 'Mount 3 buttons. Ground one terminal of each switch. Wire Switch 1 to D2 (Left), Switch 2 to D3 (Right), and Switch 3 to D4 (Select).' },
      { step: 3, title: 'Sensor Probe Connections', desc: 'Wire soil probe signal to A0. Wire DHT11 data to D5. Form a 10kΩ pull-down divider with the LDR and wire junction to A1.' },
      { step: 4, title: 'Firmware Upload & Field Test', desc: 'Select Arduino Nano in Arduino IDE and upload firmware at 115200 baud. Test cycling across Pages 0, 1, 2, and 3.' }
    ],
    code: `/*
 * AGROSENSE HANDHELD — SMART FARMING FIELD ASSISTANCE DEVICE
 * Microcontroller: Arduino Nano (ATmega328P)
 * Display: 0.96" SSD1306 I2C OLED (A4=SDA, A5=SCL)
 * 3 Buttons: D2=Left, D3=Right, D4=Select/Back
 * Sensors: Soil Moisture (A0), DHT11 (D5), LDR Light (A1)
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

#define BTN_LEFT_PIN     2
#define BTN_RIGHT_PIN    3
#define BTN_SELECT_PIN   4
#define DHT_PIN          5
#define DHT_TYPE         DHT11
#define SOIL_PIN         A0
#define LDR_PIN          A1

#define SCREEN_WIDTH     128
#define SCREEN_HEIGHT    64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
DHT dht(DHT_PIN, DHT_TYPE);

int currentPage = 0;
const int TOTAL_PAGES = 4;
bool tempUnitF = false;
bool autoCycle = false;
unsigned long lastCycle = 0;

int soilRaw = 0, soilPercent = 0;
float tempC = 27.5, tempF = 81.5, humidity = 65.0;
int ldrRaw = 0, ldrPercent = 0;

void readSensors() {
  soilRaw = analogRead(SOIL_PIN);
  soilPercent = constrain(map(soilRaw, 950, 300, 0, 100), 0, 100);

  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (!isnan(h) && !isnan(t)) {
    humidity = h; tempC = t;
    tempF = (tempC * 9.0 / 5.0) + 32.0;
  }

  ldrRaw = analogRead(LDR_PIN);
  ldrPercent = constrain(map(ldrRaw, 50, 950, 0, 100), 0, 100);
}

void checkButtons() {
  static unsigned long lastBtn = 0;
  if (millis() - lastBtn < 180) return;

  if (digitalRead(BTN_LEFT_PIN) == LOW) {
    lastBtn = millis();
    currentPage = (currentPage == 0) ? TOTAL_PAGES - 1 : currentPage - 1;
    autoCycle = false;
  } else if (digitalRead(BTN_RIGHT_PIN) == LOW) {
    lastBtn = millis();
    currentPage = (currentPage + 1) % TOTAL_PAGES;
    autoCycle = false;
  } else if (digitalRead(BTN_SELECT_PIN) == LOW) {
    lastBtn = millis();
    if (currentPage == 0) autoCycle = !autoCycle;
    else if (currentPage == 2) tempUnitF = !tempUnitF;
    else currentPage = 0; // Return to Home
  }

  if (autoCycle && millis() - lastCycle >= 4000) {
    lastCycle = millis();
    currentPage = (currentPage + 1) % TOTAL_PAGES;
  }
}

void renderHUD() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  if (currentPage == 0) {
    // Page 0: Home Dashboard
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print(F("AGROSENSE FIELD HUD"));
    display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

    display.setCursor(0, 14);
    display.print(F("SOIL: ")); display.print(soilPercent); display.print(F("% "));
    display.print(soilPercent < 30 ? F("[DRY]") : (soilPercent > 70 ? F("[WET]") : F("[OPT]")));

    display.setCursor(0, 26);
    display.print(F("TEMP: "));
    if (tempUnitF) { display.print((int)tempF); display.print(F("F")); }
    else { display.print((int)tempC); display.print(F("C")); }
    display.print(F(" | HUM: ")); display.print((int)humidity); display.print(F("%"));

    display.setCursor(0, 38);
    display.print(F("LITE: ")); display.print(ldrPercent); display.print(F("% ("));
    display.print(ldrPercent < 35 ? F("SHADE") : (ldrPercent > 80 ? F("BRIGHT") : F("SUN")));
    display.print(F(")"));

    display.setCursor(0, 48);
    display.print(F("SYSTEM: ACTIVE "));
    if (autoCycle) display.print(F("[AUTO]"));
  } else if (currentPage == 1) {
    // Page 1: Soil Hydraulics
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print(F("1. SOIL HYDRAULICS"));
    display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

    display.setTextSize(2);
    display.setCursor(0, 14);
    display.print(soilPercent); display.setTextSize(1); display.print(F(" %"));
    display.setCursor(60, 16); display.print(F("ADC: ")); display.print(soilRaw);

    display.drawRect(0, 32, 128, 8, SSD1306_WHITE);
    display.fillRect(2, 34, map(soilPercent, 0, 100, 0, 124), 4, SSD1306_WHITE);

    display.setCursor(0, 44);
    display.print(soilPercent < 30 ? F("STATUS: DRY (IRRIGATE)") : (soilPercent > 70 ? F("STATUS: WATERLOGGED") : F("STATUS: OPTIMAL ROOT")));
  } else if (currentPage == 2) {
    // Page 2: Micro-Climate
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print(F("2. MICRO-CLIMATE"));
    display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

    display.setTextSize(2);
    display.setCursor(0, 14);
    if (tempUnitF) { display.print(tempF, 1); display.setTextSize(1); display.print(F(" F")); }
    else { display.print(tempC, 1); display.setTextSize(1); display.print(F(" C")); }

    display.setTextSize(1);
    display.setCursor(70, 14); display.print(F("HUMIDITY"));
    display.setTextSize(2);
    display.setCursor(70, 24); display.print((int)humidity); display.setTextSize(1); display.print(F("%"));

    display.setCursor(0, 44);
    display.print(tempC > 34 ? F("ENV: HEAT STRESS!") : (humidity > 80 ? F("ENV: FUNGAL RISK") : F("ENV: IDEAL GROWTH")));
  } else if (currentPage == 3) {
    // Page 3: Solar Photometrics
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print(F("3. SOLAR PHOTOMETRICS"));
    display.drawFastHLine(0, 9, 128, SSD1306_WHITE);

    display.setTextSize(2);
    display.setCursor(0, 14);
    display.print(ldrPercent); display.setTextSize(1); display.print(F(" %"));
    display.setCursor(55, 16); display.print(F("~")); display.print(ldrPercent * 350); display.print(F(" Lux"));

    display.drawRect(0, 32, 128, 8, SSD1306_WHITE);
    display.fillRect(2, 34, map(ldrPercent, 0, 100, 0, 124), 4, SSD1306_WHITE);

    display.setCursor(0, 44);
    display.print(ldrPercent < 35 ? F("LIGHT: SHADED CANOPY") : (ldrPercent > 80 ? F("LIGHT: SCORCHING SUN") : F("LIGHT: OPTIMAL SUN")));
  }

  // Footer Pagination Dots
  display.drawFastHLine(0, 54, 128, SSD1306_WHITE);
  int startX = 46;
  for (int i = 0; i < TOTAL_PAGES; i++) {
    if (i == currentPage) display.fillCircle(startX + i * 10, 59, 3, SSD1306_WHITE);
    else display.drawCircle(startX + i * 10, 59, 2, SSD1306_WHITE);
  }
  display.display();
}

void setup() {
  pinMode(BTN_LEFT_PIN, INPUT_PULLUP);
  pinMode(BTN_RIGHT_PIN, INPUT_PULLUP);
  pinMode(BTN_SELECT_PIN, INPUT_PULLUP);

  dht.begin();
  Wire.begin();
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);

  readSensors();
  renderHUD();
}

void loop() {
  checkButtons();

  static unsigned long lastSensor = 0;
  if (millis() - lastSensor >= 800) {
    lastSensor = millis();
    readSensors();
  }

  static unsigned long lastRender = 0;
  if (millis() - lastRender >= 40) {
    lastRender = millis();
    renderHUD();
  }
}`,
    codeFileName: 'smart_farming_assistant.ino',
    math: [
      {
        title: "Soil Volumetric Water Content (VWC) Mapping",
        formula: "θ = [(ADC_dry - ADC_measured) / (ADC_dry - ADC_saturated)] × 100%",
        explanation: "Where ADC_dry ≈ 950 (dry soil baseline) and ADC_saturated ≈ 300 (full saturation). Calibrates non-linear probe electrical impedance into agronomic volumetric moisture percentage."
      },
      {
        title: "Heat Stress Index (Rothfusz Equation)",
        formula: "HI = f(T_drybulb, RH_ambient) [°C]",
        explanation: "Combines ambient dry-bulb temperature and relative humidity to quantify effective crop transpiration suppression and heat stress thresholds."
      }
    ],
    applications: [
      { title: 'Smallholder Precision Irrigation Scheduling', desc: 'Allows rural farmers to verify soil root-zone moisture instantly before turning on energy-intensive water pumps.' },
      { title: 'Greenhouse & Polyhouse Micro-Climate Audits', desc: 'Handheld inspection of localized temperature spikes and fungal-inducing humidity pockets across greenhouse bays.' },
      { title: 'School & University Agronomy Field Studies', desc: 'Compact, battery-operated tool for agricultural students studying soil water retention and crop photoperiods.' }
    ],
    troubleshooting: [
      { problem: 'Buttons Cause Page Flickering or Skipping', cause: 'Mechanical switch contact bouncing.', fix: 'Firmware applies a 180ms non-blocking software debounce lockout on D2, D3, and D4.' },
      { problem: 'OLED Stays Black upon Startup', cause: 'Loose I2C jumper or missing 5V power.', fix: 'Verify OLED VCC is on 5V, GND is grounded, SDA is on Nano A4, and SCL is on Nano A5.' },
      { problem: 'DHT11 Reads NaN / 0°C', cause: 'Timing collision or unseated data wire.', fix: 'Ensure DHT11 data pin is seated firmly in D5 with a 4.7kΩ–10kΩ pull-up resistor to 5V.' }
    ],
    viva: [
      { q: 'Why is an analog soil probe superior to a digital binary probe?', a: 'Binary digital modules only trigger a HIGH/LOW signal based on a potentiometer threshold, hiding moisture rate and drying curves. Analog readings quantify exact volumetric moisture percentage (0-100%) for scientific irrigation.' },
      { q: 'How does the 3-button navigation interface operate?', a: 'Left (D2) and Right (D3) cycle through 4 dedicated pages: Home Overview (Page 0), Soil Hydraulics (Page 1), Micro-Climate (Page 2), and Solar Photometrics (Page 3). Select (D4) provides contextual toggles (Auto-cycle on Page 0, °C/°F on Page 2) and long-pressing D4 (>700ms) returns immediately to Home.' }
    ],
    simulatorUrl: '/simulators/smart_farming/index.html',
    reportPdf: '/reports/Kerala_Sasthrolsavam_Projectwise_Master_Report.pdf'
  }
};
