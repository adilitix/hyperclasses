# HyperClass Remote — M5StickC Plus 2 Superadmin Controller
### Cloud Edition — talks to your Render backend over HTTPS

A physical teacher remote for the **M5StickC Plus 2** that connects to your deployed HyperClass server on **Render** over the internet — no LAN required. Just needs your phone's hotspot or any WiFi.

---

## 📦 Hardware
- **M5StickC Plus 2** (ESP32-PICO-V3-02, 135×240 colour LCD, 3 buttons)

---

## 🔧 Arduino IDE Setup

### 1 — Add M5Stack board support
File → Preferences → Additional Boards Manager URLs → add:
```
https://static.arduino.cc/packages/m5stack/package_m5stack_index.json
```
Then: Tools → Board Manager → search **M5Stack** → Install

Select board: **M5Stack → M5StickC Plus 2**

### 2 — Install Libraries (Library Manager)
| Library | Notes |
|---|---|
| **M5Unified** | ≥ 0.1.16 |
| **ArduinoJson** | ≥ 7.x |

> `WiFi`, `WiFiClientSecure`, and `HTTPClient` are built into the ESP32 Arduino core — no install needed.

---

## ⚙️ Configuration (only 4 lines to change)

Open `HyperClass_Remote.ino` and edit the top:

```cpp
#define WIFI_SSID       "MyWiFiName"
#define WIFI_PASS       "MyWiFiPassword"
#define SERVER_URL      "https://hyperclass-server.onrender.com"
#define SUPERADMIN_PASS "mammoosashi"
```

- **`SERVER_URL`** — your full Render URL (no trailing slash). Find it in your Render dashboard.
- The sketch uses `WiFiClientSecure` with `setInsecure()` so it trusts any certificate, meaning it works with Render's auto-managed TLS without needing to embed a root cert.

---

## 🕹️ Button Map

| Button | Action |
|---|---|
| **BtnA** (large front) | Scroll / cycle options |
| **BtnB** (small top) | Confirm / send / back |
| **BtnPWR** (power side) | Cycle to next screen |
| **Hold BtnA** | Stop active timer OR stop active poll |

---

## 📱 Screens (9 total, cycle with PWR)

| # | Screen | What you can do |
|---|---|---|
| 1 | **HOME** | Server online status, live session count, registrations, completions |
| 2 | **EVENTS** | All live sessions from server — A to scroll, B to select |
| 3 | **SESSION** | Session snapshot — users, chat state, timer, poll — + action sub-menu |
| 4 | **TIMER** | Pick 3/5/10/15/20/30 min — B fires it to all students |
| 5 | **BROADCAST** | 8 one-tap announcements — appear as "📢 Teacher" in chat |
| 6 | **POLLS** | Quick-launch Yes/No · A-B-C-D · Understood? · Need time? · Rate 1-5 |
| 7 | **WORKSHOP** | Set step gate (0–10) — controls how far students can advance |
| 8 | **STATS** | Registration count, completions, workshops, sessions, WiFi RSSI |
| 9 | **SYSTEM** | Server URL, ping, WiFi IP, heap — B reboots the device |

---

## 🌐 How it communicates

The device makes **plain HTTPS REST calls** (`GET`/`POST`) to your Render server — no WebSockets needed on the device side. All actions propagate to students in real time via the server's existing Socket.IO layer:

```
M5StickC  ──HTTPS──►  Render Server  ──Socket.IO──►  Students' browsers
```

### Endpoints used
| Method | Path | What it does |
|---|---|---|
| GET | `/api/ping` | Heartbeat check |
| GET | `/api/m5/overview` | Stats + all live sessions in one call |
| GET | `/api/m5/session/:id` | Snapshot of a specific session |
| POST | `/api/m5/timer/start` | Start countdown for students |
| POST | `/api/m5/timer/stop` | Stop the timer |
| POST | `/api/m5/broadcast` | Inject announcement into chat |
| POST | `/api/m5/chat/toggle` | Mute / unmute student chat |
| POST | `/api/m5/poll/start` | Launch a poll |
| POST | `/api/m5/poll/stop` | End the poll |
| POST | `/api/m5/workshop/gate` | Set max step gate |

All POST routes require `{ username, password }` superadmin credentials in the JSON body.

---

## ⚠️ Render Free Tier Note
Render free instances **sleep after 15 minutes of inactivity**. The device's `A=Refresh` / `A=Ping` buttons will wake it up (takes ~10–30 s on first connect). The server already has a self-ping mechanism to reduce sleeps during active sessions.

---

## 💡 Tips
- Poll interval is 8 seconds (`POLL_INTERVAL_MS`) — good balance between responsiveness and Render rate limits
- Green dot in the header = server reachable. Red = offline or sleeping
- You **must** select a session in EVENTS before timer/poll/broadcast work
- Workshop gate changes take effect for all open `workshop_<id>` socket rooms instantly
