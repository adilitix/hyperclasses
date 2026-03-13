/*
 * ============================================================
 *  HyperClass Remote — M5StickC Plus 2 Superadmin Controller
 * ============================================================
 *  Hardware : M5StickC Plus 2  (ESP32-PICO-V3-02)
 *  Library  : M5Unified  (https://github.com/m5stack/M5Unified)
 *             ArduinoJson ≥ 7.x
 *  Role     : Superadmin-only physical remote for HyperClass
 *             Works over the Internet → talks to Render backend
 *
 *  BUTTON MAP (physical)
 *    BtnA (large front) → scroll / cycle options
 *    BtnB (small top)   → confirm / send action / back
 *    BtnPWR (power)     → cycle to next screen
 *    Hold BtnA          → context stop (timer / poll)
 *
 *  SCREENS (cycle with BtnPWR)
 *    0  HOME       — server status, online count, quick stats
 *    1  EVENTS     — list live sessions, select one
 *    2  SESSION    — session details + action sub-menu
 *    3  TIMER      — set & fire countdown timer
 *    4  BROADCAST  — one-tap announcement into session chat
 *    5  POLLS      — quick Yes/No, A-D, rating polls
 *    6  WORKSHOP   — workshop step-gate control
 *    7  STATS      — registration & completion counts
 *    8  SYSTEM     — ping, IP info, reboot
 *
 *  ======================================================
 *  SETUP  — edit the five lines under CONFIG below
 *  ======================================================
 */

// ── Includes ─────────────────────────────────────────────────
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <M5Unified.h>
#include <WiFi.h>
#include <WiFiClientSecure.h> // ← required for HTTPS

// ── CONFIG — Edit these ──────────────────────────────────────
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASS "YOUR_WIFI_PASSWORD"

// Full Render URL — no trailing slash
// Example: "https://hyperclass-server.onrender.com"
#define SERVER_URL "https://YOUR_APP.onrender.com"

#define SUPERADMIN_USER "superadmin"
#define SUPERADMIN_PASS "mammoosashi"

// How often to refresh live data (ms). 8s is safe for Render free tier.
#define POLL_INTERVAL_MS 8000

// ── Display constants ────────────────────────────────────────
#define TFT_W 240
#define TFT_H 135
#define HDR_H 20
#define BODY_Y (HDR_H + 2)
#define LINE_H 16
#define MAX_LINES 6

// ── Colour palette ───────────────────────────────────────────
#define COL_BG 0x0821
#define COL_HDR 0x005F
#define COL_ACCENT 0xF800
#define COL_GREEN 0x07E0
#define COL_YELLOW 0xFFE0
#define COL_WHITE 0xFFFF
#define COL_GRAY 0x8410
#define COL_DARK 0x18C3

// ── Screens ───────────────────────────────────────────────────
enum Screen {
  SCR_HOME = 0,
  SCR_EVENTS,
  SCR_SESSION,
  SCR_TIMER,
  SCR_BROADCAST,
  SCR_POLLS,
  SCR_WORKSHOP,
  SCR_STATS,
  SCR_SYSTEM,
  SCR_COUNT
};
const char *SCREEN_NAMES[] = {"HOME",     "EVENTS",    "SESSION",
                              "TIMER",    "BROADCAST", "POLLS",
                              "WORKSHOP", "STATS",     "SYSTEM"};

// ── Event struct ─────────────────────────────────────────────
struct EventInfo {
  String id;
  String name;
  int userCount;
};

// ── Global state ─────────────────────────────────────────────
Screen curScreen = SCR_HOME;
int menuCursor = 0;
bool inSelectMode = false;
unsigned long lastPoll = 0;
bool wifiOk = false;
bool serverOk = false;

EventInfo events[16];
int eventCount = 0;
int selectedEvent = -1;

int sessionUsers = 0;
bool chatDisabled = false;
bool timerRunning = false;
bool activePoll = false;

int regCount = 0;
int completionCount = 0;
int workshopCount = 0;

// Timer options
const int TIMER_OPTS[] = {3, 5, 10, 15, 20, 30};
const char *TIMER_LBLS[] = {"3 min",  "5 min",  "10 min",
                            "15 min", "20 min", "30 min"};
int timerCursor = 1;

// Broadcast presets
const char *BCAST[] = {
    "Attention everyone!",   "Save your work NOW.", "10 min remaining!",
    "Workshop ending soon.", "Check slides above.", "Raise hand if stuck.",
    "Great work today!",     "Silent mode please.",
};
int bcastCursor = 0;
const int BCAST_COUNT = 8;

// Poll presets
struct PollPreset {
  const char *question;
  const char *opts[5];
  int optCount;
};
const PollPreset POLLS[] = {
    {"Quick Vote", {"Yes", "No", nullptr, nullptr, nullptr}, 2},
    {"A / B / C / D", {"A", "B", "C", "D", nullptr}, 4},
    {"Did you understand?", {"Yes", "No", nullptr, nullptr, nullptr}, 2},
    {"Need more time?", {"Yes", "No", nullptr, nullptr, nullptr}, 2},
    {"Rate this session", {"1", "2", "3", "4", "5"}, 5},
};
int pollCursor = 0;
const int POLL_COUNT = 5;

// Workshop gate
int wsCursor = 0;
int wsGate = 0;
const int WS_MAX = 10;

// ── Forward declarations ─────────────────────────────────────
void drawBody();
void drawHeader(const char *title);
void drawRow(int row, const char *label, const char *value, uint16_t lc,
             uint16_t vc, bool hi);
void drawHome();
void drawEvents();
void drawSession();
void drawTimer();
void drawBroadcast();
void drawPolls();
void drawWorkshop();
void drawStats();
void drawSystemScreen();
void handleBtnA();
void handleBtnB();
void fetchEvents();
void fetchSessionStatus();
void fetchStats();
void sendTimerStart(int m);
void sendTimerStop();
void sendBroadcast(int i);
void sendStartPoll(int i);
void sendStopPoll();
void sendToggleChat();
void sendGate(int s);
bool serverPing();
String httpsGET(String path);
String httpsPOST(String path, String body);

// ── HTTPS helpers ────────────────────────────────────────────
// Uses WiFiClientSecure with setInsecure() — skips certificate
// validation (fine for an internal tool talking to your own server).
String httpsGET(String path) {
  if (!wifiOk || WiFi.status() != WL_CONNECTED)
    return "";
  WiFiClientSecure cli;
  cli.setInsecure(); // trust any cert
  HTTPClient http;
  String url = String(SERVER_URL) + path;
  if (!http.begin(cli, url))
    return "";
  http.setTimeout(6000);
  int code = http.GET();
  String resp = (code > 0) ? http.getString() : "";
  http.end();
  return resp;
}

String httpsPOST(String path, String body) {
  if (!wifiOk || WiFi.status() != WL_CONNECTED)
    return "";
  WiFiClientSecure cli;
  cli.setInsecure();
  HTTPClient http;
  String url = String(SERVER_URL) + path;
  if (!http.begin(cli, url))
    return "";
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(6000);
  int code = http.POST(body);
  String resp = (code > 0) ? http.getString() : "";
  http.end();
  return resp;
}

// ── Auth helper ──────────────────────────────────────────────
// Appends the superadmin credentials + eventId to a JSON object string.
// Call like: authBody("{\"minutes\":5", selectedEvent)
String authBody(String inner, int evIdx) {
  String base = inner;
  if (evIdx >= 0 && evIdx < eventCount) {
    base += ",\"eventId\":\"" + events[evIdx].id + "\"";
  }
  base += ",\"username\":\"" SUPERADMIN_USER
          "\",\"password\":\"" SUPERADMIN_PASS "\"}";
  return base;
}

// ── Setup ─────────────────────────────────────────────────────
void setup() {
  auto cfg = M5.config();
  M5.begin(cfg);

  M5.Display.setRotation(1); // landscape
  M5.Display.setColorDepth(16);
  M5.Display.fillScreen(COL_BG);

  // Splash
  M5.Display.setTextSize(2);
  M5.Display.setTextColor(COL_ACCENT, COL_BG);
  M5.Display.setCursor(8, 12);
  M5.Display.print("HyperClass");
  M5.Display.setTextSize(1);
  M5.Display.setTextColor(COL_GRAY, COL_BG);
  M5.Display.setCursor(4, 40);
  M5.Display.print("Superadmin Remote v2");
  M5.Display.setCursor(4, 54);
  M5.Display.print("Cloud Edition (Render)");

  // WiFi
  M5.Display.setTextColor(COL_YELLOW, COL_BG);
  M5.Display.setCursor(4, 76);
  M5.Display.print("Connecting WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 12000) {
    delay(300);
    M5.Display.print(".");
  }
  wifiOk = (WiFi.status() == WL_CONNECTED);
  M5.Display.setCursor(4, 92);
  if (wifiOk) {
    M5.Display.setTextColor(COL_GREEN, COL_BG);
    M5.Display.print("WiFi OK  ");
    M5.Display.print(WiFi.localIP());
  } else {
    M5.Display.setTextColor(COL_ACCENT, COL_BG);
    M5.Display.print("WiFi FAILED");
  }

  // Server ping (Render may be cold-starting — give it a moment)
  delay(1000);
  if (wifiOk) {
    M5.Display.setTextColor(COL_YELLOW, COL_BG);
    M5.Display.setCursor(4, 108);
    M5.Display.print("Reaching server");
    serverOk = serverPing();
    M5.Display.setTextColor(serverOk ? COL_GREEN : COL_ACCENT, COL_BG);
    M5.Display.print(serverOk ? "  OK" : "  TIMEOUT");
    if (serverOk) {
      fetchEvents();
      fetchStats();
    }
  }
  delay(1200);
  drawBody();
}

// ── Loop ──────────────────────────────────────────────────────
void loop() {
  M5.update();

  if (M5.BtnA.wasClicked())
    handleBtnA();
  if (M5.BtnB.wasClicked())
    handleBtnB();

  // Power button → next screen
  if (M5.BtnPWR.wasClicked()) {
    curScreen = (Screen)((curScreen + 1) % SCR_COUNT);
    menuCursor = 0;
    inSelectMode = false;
    drawBody();
  }

  // Hold BtnA → context stop
  if (M5.BtnA.wasHold()) {
    if (curScreen == SCR_TIMER && timerRunning) {
      sendTimerStop();
    } else if (curScreen == SCR_POLLS && activePoll) {
      sendStopPoll();
    }
    drawBody();
  }

  // Periodic refresh
  if (wifiOk && millis() - lastPoll > POLL_INTERVAL_MS) {
    lastPoll = millis();
    serverOk = serverPing();
    fetchEvents();
    if (selectedEvent >= 0)
      fetchSessionStatus();
    fetchStats();
    drawBody();
  }

  delay(30);
}

// ── Button A: scroll / cycle ──────────────────────────────────
void handleBtnA() {
  switch (curScreen) {
  case SCR_HOME:
    fetchEvents();
    fetchStats();
    serverOk = serverPing();
    break;
  case SCR_EVENTS:
    if (eventCount > 0)
      menuCursor = (menuCursor + 1) % eventCount;
    break;
  case SCR_SESSION:
    if (!inSelectMode) {
      inSelectMode = true;
      menuCursor = 0;
    } else
      menuCursor = (menuCursor + 1) % 4;
    break;
  case SCR_TIMER:
    timerCursor = (timerCursor + 1) % 6;
    break;
  case SCR_BROADCAST:
    bcastCursor = (bcastCursor + 1) % BCAST_COUNT;
    break;
  case SCR_POLLS:
    pollCursor = (pollCursor + 1) % POLL_COUNT;
    break;
  case SCR_WORKSHOP:
    wsCursor = (wsCursor < WS_MAX) ? wsCursor + 1 : 0;
    break;
  case SCR_STATS:
    fetchStats();
    break;
  case SCR_SYSTEM:
    serverOk = serverPing();
    break;
  }
  drawBody();
}

// ── Button B: confirm / send / back ──────────────────────────
void handleBtnB() {
  switch (curScreen) {
  case SCR_EVENTS:
    if (eventCount > 0) {
      selectedEvent = menuCursor;
      fetchSessionStatus();
      curScreen = SCR_SESSION;
      menuCursor = 0;
      inSelectMode = false;
    }
    break;
  case SCR_SESSION:
    if (inSelectMode) {
      switch (menuCursor) {
      case 0:
        sendToggleChat();
        break;
      case 1:
        curScreen = SCR_TIMER;
        break;
      case 2:
        curScreen = SCR_BROADCAST;
        break;
      case 3:
        selectedEvent = -1;
        inSelectMode = false;
        break;
      }
      if (menuCursor != 3)
        inSelectMode = false;
    } else {
      // Go back to events
      curScreen = SCR_EVENTS;
      menuCursor = (selectedEvent >= 0) ? selectedEvent : 0;
    }
    break;
  case SCR_TIMER:
    if (selectedEvent >= 0) {
      sendTimerStart(TIMER_OPTS[timerCursor]);
      timerRunning = true;
    }
    break;
  case SCR_BROADCAST:
    if (selectedEvent >= 0)
      sendBroadcast(bcastCursor);
    break;
  case SCR_POLLS:
    if (selectedEvent >= 0)
      sendStartPoll(pollCursor);
    break;
  case SCR_WORKSHOP:
    if (selectedEvent >= 0) {
      wsGate = wsCursor;
      sendGate(wsGate);
    }
    break;
  case SCR_SYSTEM:
    // Reboot
    M5.Display.fillScreen(COL_BG);
    M5.Display.setTextColor(COL_ACCENT, COL_BG);
    M5.Display.setCursor(40, 50);
    M5.Display.setTextSize(2);
    M5.Display.print("Rebooting");
    delay(1000);
    ESP.restart();
    break;
  default:
    curScreen = SCR_HOME;
    menuCursor = 0;
    inSelectMode = false;
    break;
  }
  drawBody();
}

// ── Draw dispatcher ───────────────────────────────────────────
void drawBody() {
  M5.Display.fillScreen(COL_BG);
  drawHeader(SCREEN_NAMES[curScreen]);
  switch (curScreen) {
  case SCR_HOME:
    drawHome();
    break;
  case SCR_EVENTS:
    drawEvents();
    break;
  case SCR_SESSION:
    drawSession();
    break;
  case SCR_TIMER:
    drawTimer();
    break;
  case SCR_BROADCAST:
    drawBroadcast();
    break;
  case SCR_POLLS:
    drawPolls();
    break;
  case SCR_WORKSHOP:
    drawWorkshop();
    break;
  case SCR_STATS:
    drawStats();
    break;
  case SCR_SYSTEM:
    drawSystemScreen();
    break;
  }
}

// ── Header ────────────────────────────────────────────────────
void drawHeader(const char *title) {
  M5.Display.fillRect(0, 0, TFT_W, HDR_H, COL_HDR);
  M5.Display.setTextColor(COL_WHITE, COL_HDR);
  M5.Display.setTextSize(1);
  M5.Display.setCursor(4, 6);
  M5.Display.print(title);

  // Screen index
  char idx[8];
  snprintf(idx, sizeof(idx), "%d/%d", curScreen + 1, (int)SCR_COUNT);
  M5.Display.setTextColor(COL_GRAY, COL_HDR);
  M5.Display.setCursor(TFT_W - 40, 6);
  M5.Display.print(idx);

  // Status dot
  M5.Display.fillCircle(TFT_W - 10, HDR_H / 2, 4,
                        serverOk ? COL_GREEN : COL_ACCENT);
}

void drawRow(int row, const char *label, const char *value, uint16_t lc,
             uint16_t vc, bool hi) {
  int y = BODY_Y + row * LINE_H;
  if (hi)
    M5.Display.fillRect(0, y - 1, TFT_W, LINE_H, COL_DARK);
  M5.Display.setTextColor(lc, hi ? COL_DARK : COL_BG);
  M5.Display.setCursor(4, y + 2);
  M5.Display.print(label);
  if (value && strlen(value)) {
    int vx = TFT_W - strlen(value) * 6 - 4;
    if (vx < 100)
      vx = 100;
    M5.Display.setTextColor(vc, hi ? COL_DARK : COL_BG);
    M5.Display.setCursor(vx, y + 2);
    M5.Display.print(value);
  }
}

// ── HOME ──────────────────────────────────────────────────────
void drawHome() {
  char buf[32];
  drawRow(0, "Server:", serverOk ? "ONLINE" : "OFFLINE", COL_GRAY,
          serverOk ? COL_GREEN : COL_ACCENT, false);

  snprintf(buf, sizeof(buf), "%d", eventCount);
  drawRow(1, "Live Sessions:", buf, COL_GRAY, COL_YELLOW, false);

  snprintf(buf, sizeof(buf), "%d", regCount);
  drawRow(2, "Registrations:", buf, COL_GRAY, COL_WHITE, false);

  snprintf(buf, sizeof(buf), "%d", completionCount);
  drawRow(3, "Completions:", buf, COL_GRAY, COL_GREEN, false);

  if (selectedEvent >= 0) {
    String n = events[selectedEvent].name;
    if (n.length() > 20)
      n = n.substring(0, 19) + "~";
    drawRow(4, "Active:", n.c_str(), COL_GRAY, COL_ACCENT, false);
  } else {
    drawRow(4, "Active Session:", "none", COL_GRAY, COL_GRAY, false);
  }

  M5.Display.setTextColor(COL_GRAY, COL_BG);
  M5.Display.setCursor(4, BODY_Y + LINE_H * 5 + 4);
  M5.Display.print("PWR=Next  A=Refresh");
}

// ── EVENTS ────────────────────────────────────────────────────
void drawEvents() {
  if (!wifiOk) {
    drawRow(0, "No WiFi connection", "", COL_ACCENT, 0, false);
    return;
  }
  if (eventCount == 0) {
    drawRow(0, "No live sessions", "", COL_GRAY, 0, false);
    drawRow(1, "A=Retry", "", COL_GRAY, 0, false);
    return;
  }
  M5.Display.setTextColor(COL_GRAY, COL_BG);
  M5.Display.setCursor(4, BODY_Y + 2);
  M5.Display.print("A=Scroll  B=Select");

  for (int i = 0; i < eventCount && i < MAX_LINES - 1; i++) {
    char cnt[8];
    snprintf(cnt, sizeof(cnt), "%du", events[i].userCount);
    String name = events[i].name;
    if (name.length() > 22)
      name = name.substring(0, 21) + "~";
    drawRow(i + 1, name.c_str(), cnt, COL_WHITE, COL_YELLOW, i == menuCursor);
  }
}

// ── SESSION ───────────────────────────────────────────────────
void drawSession() {
  if (selectedEvent < 0) {
    drawRow(0, "No session selected", "", COL_ACCENT, 0, false);
    drawRow(1, "EVENTS -> select first", "", COL_GRAY, 0, false);
    return;
  }
  String n = events[selectedEvent].name;
  if (n.length() > 26)
    n = n.substring(0, 25) + "~";
  M5.Display.setTextColor(COL_ACCENT, COL_BG);
  M5.Display.setCursor(4, BODY_Y + 2);
  M5.Display.print(n);

  char buf[20];
  snprintf(buf, sizeof(buf), "%d online", sessionUsers);
  drawRow(1, "Users:", buf, COL_GRAY, COL_YELLOW, false);
  drawRow(2, "Chat:", chatDisabled ? "MUTED" : "OPEN", COL_GRAY,
          chatDisabled ? COL_ACCENT : COL_GREEN, false);
  drawRow(3, "Timer:", timerRunning ? "RUNNING" : "idle", COL_GRAY,
          timerRunning ? COL_GREEN : COL_GRAY, false);
  drawRow(4, "Poll:", activePoll ? "ACTIVE" : "none", COL_GRAY,
          activePoll ? COL_YELLOW : COL_GRAY, false);

  const char *actions[] = {"Toggle Chat", "Set Timer", "Broadcast", "Deselect"};
  M5.Display.setTextColor(COL_GRAY, COL_BG);
  M5.Display.setCursor(4, BODY_Y + LINE_H * 5 + 2);
  if (!inSelectMode)
    M5.Display.print("B=Menu  (A selects)");
  else {
    for (int i = 0; i < 4; i++) {
      M5.Display.setTextColor(i == menuCursor ? COL_ACCENT : COL_GRAY, COL_BG);
      M5.Display.setCursor(4 + i * 58, BODY_Y + LINE_H * 5 + 4);
      M5.Display.print(actions[i][0]); // first char abbreviation
    }
    M5.Display.setTextColor(COL_GRAY, COL_BG);
    M5.Display.setCursor(4, BODY_Y + LINE_H * 6 + 2);
    M5.Display.print("A=Cycle  B=Confirm");
  }
}

// ── TIMER ─────────────────────────────────────────────────────
void drawTimer() {
  M5.Display.setTextColor(COL_GRAY, COL_BG);
  M5.Display.setCursor(4, BODY_Y + 2);
  M5.Display.print("A=Cycle  B=Start  HoldA=Stop");

  M5.Display.setTextSize(3);
  M5.Display.setTextColor(COL_ACCENT, COL_BG);
  M5.Display.setCursor(60, BODY_Y + 20);
  M5.Display.print(TIMER_LBLS[timerCursor]);
  M5.Display.setTextSize(1);

  drawRow(4, "Status:", timerRunning ? "RUNNING" : "idle", COL_GRAY,
          timerRunning ? COL_GREEN : COL_GRAY, false);

  if (selectedEvent < 0)
    drawRow(5, "! Select a session first", "", COL_ACCENT, 0, false);
}

// ── BROADCAST ────────────────────────────────────────────────
void drawBroadcast() {
  M5.Display.setTextColor(COL_GRAY, COL_BG);
  M5.Display.setCursor(4, BODY_Y + 2);
  M5.Display.print("A=Cycle  B=SEND");

  M5.Display.setTextColor(COL_ACCENT, COL_BG);
  M5.Display.setCursor(4, BODY_Y + 20);
  String cur = BCAST[bcastCursor];
  M5.Display.print("\"" + cur + "\"");

  for (int i = 0; i < BCAST_COUNT; i++) {
    String s = BCAST[i];
    if (s.length() > 28)
      s = s.substring(0, 27) + "~";
    drawRow(i + 2, s.c_str(), "", i == bcastCursor ? COL_ACCENT : COL_GRAY, 0,
            i == bcastCursor);
  }
  if (selectedEvent < 0)
    drawRow(MAX_LINES, "! Select session first", "", COL_ACCENT, 0, false);
}

// ── POLLS ─────────────────────────────────────────────────────
void drawPolls() {
  M5.Display.setTextColor(COL_GRAY, COL_BG);
  M5.Display.setCursor(4, BODY_Y + 2);
  M5.Display.print("A=Cycle  B=Start  HoldA=Stop");

  M5.Display.setTextColor(COL_YELLOW, COL_BG);
  M5.Display.setCursor(4, BODY_Y + 20);
  M5.Display.print(POLLS[pollCursor].question);

  for (int i = 0; i < POLL_COUNT; i++) {
    drawRow(i + 2, POLLS[i].question, "",
            i == pollCursor ? COL_YELLOW : COL_GRAY, 0, i == pollCursor);
  }

  drawRow(MAX_LINES, activePoll ? "Poll: ACTIVE" : "Poll: none", "",
          activePoll ? COL_GREEN : COL_GRAY, 0, false);

  if (selectedEvent < 0)
    drawRow(MAX_LINES, "! Select session first", "", COL_ACCENT, 0, false);
}

// ── WORKSHOP GATE ─────────────────────────────────────────────
void drawWorkshop() {
  M5.Display.setTextColor(COL_GRAY, COL_BG);
  M5.Display.setCursor(4, BODY_Y + 2);
  M5.Display.print("A=Step +  B=Apply Gate");

  M5.Display.setTextSize(4);
  M5.Display.setTextColor(COL_ACCENT, COL_BG);
  M5.Display.setCursor(90, BODY_Y + 18);
  M5.Display.print(wsCursor);
  M5.Display.setTextSize(1);

  char cur[24];
  snprintf(cur, sizeof(cur), "Applied gate: %d", wsGate);
  drawRow(4, cur, "", COL_GREEN, 0, false);
  drawRow(5, "Students locked to this step", "", COL_GRAY, 0, false);

  if (selectedEvent < 0)
    drawRow(MAX_LINES, "! Select session first", "", COL_ACCENT, 0, false);
}

// ── STATS ─────────────────────────────────────────────────────
void drawStats() {
  char buf[28];
  drawRow(0, "A=Refresh data", "", COL_GRAY, 0, false);

  snprintf(buf, sizeof(buf), "%d", regCount);
  drawRow(1, "Registrations:", buf, COL_GRAY, COL_WHITE, false);

  snprintf(buf, sizeof(buf), "%d", completionCount);
  drawRow(2, "Completions:", buf, COL_GRAY, COL_GREEN, false);

  snprintf(buf, sizeof(buf), "%d", workshopCount);
  drawRow(3, "Workshops:", buf, COL_GRAY, COL_YELLOW, false);

  snprintf(buf, sizeof(buf), "%d", eventCount);
  drawRow(4, "Live Sessions:", buf, COL_GRAY, COL_ACCENT, false);

  if (wifiOk) {
    snprintf(buf, sizeof(buf), "%d dBm", WiFi.RSSI());
    drawRow(5, "WiFi RSSI:", buf, COL_GRAY, COL_GRAY, false);
  }
}

// ── SYSTEM ────────────────────────────────────────────────────
void drawSystemScreen() {
  char buf[40];
  drawRow(0, "A=Ping server  B=Reboot", "", COL_GRAY, 0, false);

  drawRow(1, "Server:", serverOk ? "ONLINE" : "OFFLINE", COL_GRAY,
          serverOk ? COL_GREEN : COL_ACCENT, false);

  snprintf(buf, sizeof(buf), "%s", SERVER_URL);
  // Truncate if needed
  String su = String(SERVER_URL).substring(8); // strip "https://"
  if (su.length() > 28)
    su = su.substring(0, 27) + "~";
  drawRow(2, su.c_str(), "", COL_GRAY, 0, false);

  if (wifiOk) {
    drawRow(3, "WiFi IP:", WiFi.localIP().toString().c_str(), COL_GRAY,
            COL_WHITE, false);
    snprintf(buf, sizeof(buf), "%d dBm", WiFi.RSSI());
    drawRow(4, "RSSI:", buf, COL_GRAY, COL_YELLOW, false);
  } else {
    drawRow(3, "WiFi:", "DISCONNECTED", COL_GRAY, COL_ACCENT, false);
  }

  snprintf(buf, sizeof(buf), "%d B", ESP.getFreeHeap());
  drawRow(5, "Free Heap:", buf, COL_GRAY, COL_GRAY, false);
}

// ── Data fetchers ─────────────────────────────────────────────
bool serverPing() {
  String r = httpsGET("/api/ping");
  return r.length() > 0;
}

void fetchEvents() {
  String r = httpsGET("/api/events");
  if (r.length() == 0) {
    eventCount = 0;
    return;
  }
  DynamicJsonDocument doc(4096);
  if (deserializeJson(doc, r) != DeserializationError::Ok)
    return;
  eventCount = 0;
  for (JsonObject ev : doc.as<JsonArray>()) {
    if (eventCount >= 16)
      break;
    events[eventCount].id = ev["id"].as<String>();
    events[eventCount].name = ev["name"].as<String>();
    events[eventCount].userCount = ev["userCount"] | 0;
    eventCount++;
  }
  if (menuCursor >= eventCount && eventCount > 0)
    menuCursor = eventCount - 1;
  if (selectedEvent >= eventCount)
    selectedEvent = -1;
}

void fetchSessionStatus() {
  if (selectedEvent < 0)
    return;
  String r = httpsGET("/api/m5/session/" + events[selectedEvent].id);
  if (r.length() == 0)
    return;
  DynamicJsonDocument doc(512);
  if (deserializeJson(doc, r) != DeserializationError::Ok)
    return;
  sessionUsers = doc["userCount"] | 0;
  chatDisabled = doc["chatDisabled"] | false;
  timerRunning = doc["timerActive"] | false;
  activePoll = doc["activePoll"] | false;
  wsGate = doc["workshopGate"] | 0;
}

void fetchStats() {
  // Use the lightweight /api/m5/overview endpoint
  String r = httpsGET("/api/m5/overview");
  if (r.length() == 0)
    return;
  DynamicJsonDocument doc(1024);
  if (deserializeJson(doc, r) != DeserializationError::Ok)
    return;
  regCount = doc["registrations"] | 0;
  completionCount = doc["completions"] | 0;
  workshopCount = doc["workshops"] | 0;
  // Also refresh eventCount from overview
  JsonArray sessions = doc["liveSessions"].as<JsonArray>();
  int cnt = 0;
  for (JsonObject s : sessions) {
    if (cnt >= 16)
      break;
    events[cnt].id = s["id"].as<String>();
    events[cnt].name = s["name"].as<String>();
    events[cnt].userCount = s["userCount"] | 0;
    cnt++;
  }
  eventCount = cnt;
}

// ── Action senders ────────────────────────────────────────────
void sendTimerStart(int minutes) {
  if (selectedEvent < 0)
    return;
  String body = authBody("{\"minutes\":" + String(minutes), selectedEvent);
  httpsPOST("/api/m5/timer/start", body);
}

void sendTimerStop() {
  if (selectedEvent < 0)
    return;
  String body = authBody("{", selectedEvent);
  httpsPOST("/api/m5/timer/stop", body);
  timerRunning = false;
}

void sendBroadcast(int idx) {
  if (selectedEvent < 0)
    return;
  String msg = String(BCAST[idx]);
  msg.replace("\"", "\\\"");
  String body =
      authBody("{\"message\":\"[TEACHER] " + msg + "\"", selectedEvent);
  httpsPOST("/api/m5/broadcast", body);
}

void sendStartPoll(int idx) {
  if (selectedEvent < 0)
    return;
  const PollPreset &p = POLLS[idx];
  String optArr = "[";
  for (int i = 0; i < p.optCount; i++) {
    if (i)
      optArr += ",";
    optArr += "\"";
    optArr += p.opts[i];
    optArr += "\"";
  }
  optArr += "]";
  String q = String(p.question);
  q.replace("\"", "\\\"");
  String body = authBody("{\"question\":\"" + q + "\",\"options\":" + optArr,
                         selectedEvent);
  httpsPOST("/api/m5/poll/start", body);
  activePoll = true;
}

void sendStopPoll() {
  if (selectedEvent < 0)
    return;
  String body = authBody("{", selectedEvent);
  httpsPOST("/api/m5/poll/stop", body);
  activePoll = false;
}

void sendToggleChat() {
  if (selectedEvent < 0)
    return;
  String newVal = chatDisabled ? "false" : "true";
  String body = authBody("{\"disabled\":" + newVal, selectedEvent);
  httpsPOST("/api/m5/chat/toggle", body);
  chatDisabled = !chatDisabled;
}

void sendGate(int step) {
  if (selectedEvent < 0)
    return;
  String body = authBody("{\"maxStep\":" + String(step), selectedEvent);
  httpsPOST("/api/m5/workshop/gate", body);
}
