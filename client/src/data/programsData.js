export const INITIAL_PROGRAMS = [
  {
    id: "prog-robotics-esp32",
    title: "Autonomous Mobile Robotics & Microcontrollers with ESP32",
    code: "HYPER-ROB-101",
    department: "Robotics & Mechatronics",
    category: "Robotics",
    duration: "3-Day Intensive Bootcamp (or 30-Hour VAC)",
    level: "All Engineering Streams",
    targetBatch: "2nd, 3rd & 4th Year B.Tech (ECE/EEE/MECH/CSE)",
    desc: "A complete hands-on engineering program focused on building sensor-guided autonomous robots using ESP32, FreeRTOS multi-threading, motor drivers, ultrasound LIDAR, and WiFi teleoperation.",
    imageIcon: "🤖",
    prerequisites: "Basic C/C++ programming or logic understanding",
    hardwareKit: [
      "ESP32 Dual-Core Dev Board with WiFi/BT",
      "L298N / TB6612FNG Dual Motor Driver",
      "Ultrasonic Ranging Sensors & HC-SR04",
      "Infrared Array Sensors (Line Following)",
      "Robot Chassis, High-Torque Gear Motors & Battery Pack",
      "Custom PCB Sensor Shield & Wire Harness"
    ],
    highlights: [
      "100% Practical hands-on kit provided to student groups",
      "Build & keep a working autonomous obstacle-avoiding robot",
      "Multi-threading & real-time motor control via ESP32 FreeRTOS",
      "Web Dashboard & Joystick App teleoperation over WebSocket",
      "Blockchain-Verified QR Certificate + Project GitHub Repo"
    ],
    modules: [
      {
        moduleNumber: 1,
        title: "Module 1: Embedded Fundamentals & ESP32 Microcontroller Architecture",
        duration: "Day 1 (4 Hours)",
        topics: [
          "Introduction to Microcontrollers: AVR vs ARM vs ESP32 Tensilica Dual-Core",
          "ESP32 Pinout, GPIO, PWM Motor Control, ADC, UART, SPI & I2C Protocols",
          "Setting up the Hyperclass IDE & Arduino Framework",
          "Timer Interrupts and Hardware PWM Signal Generation"
        ],
        project: "Lab 1: Precision Motor Speed Control & RGB Status Indicator Circuit"
      },
      {
        moduleNumber: 2,
        title: "Module 2: Sensors, Motor Controllers & Kinematic Motion",
        duration: "Day 2 (4 Hours)",
        topics: [
          "Interfacing H-Bridge Driver Circuits (L298N/TB6612) with PWM Signal Calibration",
          "Sensor Integration: Ultrasonic Ranging & Analog Infrared Sensor Processing",
          "Kinematic Motion Algorithms: Differential Drive, Smooth Acceleration & PID Control",
          "Autonomous Obstacle Avoidance & Wall-Following Logic State Machine"
        ],
        project: "Lab 2: Autonomous Obstacle-Navigating Robot Challenge"
      },
      {
        moduleNumber: 3,
        title: "Module 3: Wireless Teleoperation, IoT Cloud & Mini Hackathon Showcase",
        duration: "Day 3 (4 Hours)",
        topics: [
          "ESP32 SoftAP & Web Server: Real-time HTTP/WebSocket Telemetry",
          "Building a Mobile/Browser Virtual Joystick Control UI",
          "Live Data Streaming: Sensor Telemetry on Hyperclass Live Dashboard",
          "Final Inter-Departmental Bot Race & Certificate Presentation"
        ],
        project: "Capstone: WiFi Tele-Operated Robot with Live Sensor Data Stream"
      }
    ]
  },

  {
    id: "prog-mern-fullstack",
    title: "Full-Stack Web Engineering with MERN & Next.js Architecture",
    code: "HYPER-CS-201",
    department: "Computer Science & IT",
    category: "Full-Stack Dev",
    duration: "3-Day Bootcamp / 5-Day Intensive",
    level: "Beginner to Intermediate",
    targetBatch: "1st, 2nd & 3rd Year B.Tech / BCA / MCA",
    desc: "Master modern web development by building production-grade scalable web applications using React 18, Node.js, Express, MongoDB Atlas, and TailwindCSS with real-time WebSockets.",
    imageIcon: "💻",
    prerequisites: "HTML/CSS fundamentals",
    hardwareKit: [
      "Cloud Sandbox Access with Node.js & MongoDB Atlas Cluster",
      "Vercel / Render Deployment Environment",
      "HyperFlow Code Studio Live Workspace"
    ],
    highlights: [
      "Build a live multi-tenant Web Application from scratch",
      "JWT Authentication & Role-Based Access Control (RBAC)",
      "REST API Design & WebSockets for real-time live features",
      "One-click Deployment to Cloud Vercel/Render",
      "Industry Placement Project Portfolio on GitHub"
    ],
    modules: [
      {
        moduleNumber: 1,
        title: "Module 1: Modern JavaScript (ES6+), React 18 & Component Systems",
        duration: "Day 1 (4 Hours)",
        topics: [
          "ES6 Modules, Async/Await, Destructuring, and Functional Patterns",
          "React 18 Architecture: JSX, Virtual DOM, Hooks (useState, useEffect, useRef)",
          "State Management & Props Drilling Solutions (Context API)",
          "Modern UI Styling with CSS Modules & Tailwind Utilities"
        ],
        project: "Lab 1: Interactive Real-Time Dashboard Component UI"
      },
      {
        moduleNumber: 2,
        title: "Module 2: Backend Architecture with Node.js, Express & MongoDB",
        duration: "Day 2 (4 Hours)",
        topics: [
          "Node.js Event Loop, Non-blocking I/O & Express Server Setup",
          "Designing RESTful APIs & Middleware (CORS, Request Validation)",
          "MongoDB Atlas NoSQL Database Schemas & Mongoose ORM Models",
          "User Authentication with Password Hashing (Bcrypt) & JWT Tokens"
        ],
        project: "Lab 2: Secure User Authentication & REST API Microservice"
      },
      {
        moduleNumber: 3,
        title: "Module 3: Full-Stack Integration, WebSockets & Production Cloud Deployment",
        duration: "Day 3 (4 Hours)",
        topics: [
          "Connecting React Frontend with Express Backend APIs using Axios/Fetch",
          "Real-Time Bi-Directional Communication with Socket.IO",
          "Production Build Optimization, Environment Variables & Security",
          "Deploying Frontend to Vercel and Backend to Render / AWS"
        ],
        project: "Capstone: Live Collaboration App with Real-Time Messaging & Cloud DB"
      }
    ]
  },

  {
    id: "prog-ai-genai",
    title: "Applied Generative AI & Large Language Model (LLM) Engineering",
    code: "HYPER-AI-301",
    department: "Artificial Intelligence & Data Science",
    category: "AI & Data",
    duration: "2-Day / 3-Day Hands-on Workshop",
    level: "Intermediate",
    targetBatch: "2nd, 3rd & 4th Year B.Tech (AI/DS/CSE/ECE)",
    desc: "Learn to build intelligent AI applications using Python, LangChain, OpenAI APIs, HuggingFace Models, Vector Databases (Pinecone/ChromaDB), and RAG (Retrieval-Augmented Generation).",
    imageIcon: "🧠",
    prerequisites: "Basic Python programming skills",
    hardwareKit: [
      "GPU-Accelerated Cloud Notebook Sandbox (Google Colab Pro)",
      "OpenAI & HuggingFace API Development Keys",
      "Vector Database Cloud Accounts"
    ],
    highlights: [
      "Build a custom AI Document Q&A Bot using your own College Syllabi/PDFs",
      "Implement Retrieval-Augmented Generation (RAG) Architecture",
      "Prompt Engineering, Fine-tuning vs Prompting, Vector Embeddings",
      "Deploy Streamlit / Gradio AI Web Interfaces",
      "Verified Certificate in Generative AI Application Development"
    ],
    modules: [
      {
        moduleNumber: 1,
        title: "Module 1: Foundations of LLMs, Prompt Engineering & Embeddings",
        duration: "Day 1 (4 Hours)",
        topics: [
          "Understanding Transformer Architecture & Large Language Models",
          "API Integration: OpenAI GPT-4, Anthropic Claude & HuggingFace Models",
          "Advanced Prompt Engineering: Zero-Shot, Few-Shot, Chain-of-Thought",
          "Text Embeddings, High-Dimensional Vector Spaces & Similarity Metrics"
        ],
        project: "Lab 1: Intelligent Automated Code Explainer & Resume Analyzer Bot"
      },
      {
        moduleNumber: 2,
        title: "Module 2: RAG Architecture & Vector Databases (ChromaDB/Pinecone)",
        duration: "Day 2 (4 Hours)",
        topics: [
          "Retrieval-Augmented Generation (RAG) System Design",
          "PDF/Document Parsing, Chunking Strategies & Token Limit Management",
          "Vector Databases: Storing and Querying Embeddings in ChromaDB",
          "LangChain Framework: Memory, Chains, and Agents"
        ],
        project: "Lab 2: Custom Document Assistant (Ask Any PDF / College Manual)"
      },
      {
        moduleNumber: 3,
        title: "Module 3: AI Agents, Streamlit Web App UI & Deployment",
        duration: "Day 3 (4 Hours)",
        topics: [
          "Building Autonomous AI Agents with Tool Access (Web Search, Math)",
          "Building Interactive User Interfaces with Streamlit / Gradio",
          "Rate Limiting, Cost Optimization & Security in AI Applications",
          "Final Project Presentations & Industry AI Roadmap"
        ],
        project: "Capstone: Multi-Modal Institutional Knowledge Assistant Web App"
      }
    ]
  },

  {
    id: "prog-iot-esp32-cloud",
    title: "Industrial IoT Systems, Smart Sensors & Cloud Telemetry with ESP32",
    code: "HYPER-IOT-102",
    department: "Electronics & Electrical",
    category: "IoT & Embedded",
    duration: "2-Day / 3-Day Hands-on Workshop",
    level: "All Engineering Streams",
    targetBatch: "2nd & 3rd Year B.Tech (ECE/EEE/CSE/INST)",
    desc: "Comprehensive practical training on building Industrial IoT nodes, MQTT protocol messaging, sensor data acquisition, cloud telemetry dashboards, and edge trigger alerts.",
    imageIcon: "⚡",
    prerequisites: "Basic programming & circuits",
    hardwareKit: [
      "ESP32 Development Board",
      "DHT11 Temperature & Humidity Sensor",
      "Relay Module (AC Load Switching)",
      "LDR Light Sensor & OLED Display (SSD1306)",
      "MQ-135 Air Quality Sensor & Buzzer"
    ],
    highlights: [
      "Connect physical sensors to Cloud Dashboards in real-time",
      "MQTT Broker Communication (Mosquitto & HiveMQ)",
      "Node-RED & Blynk Cloud Automation Setup",
      "SMS & WhatsApp Alert Triggers for threshold violations",
      "Hands-on Industrial Smart Factory prototype kit"
    ],
    modules: [
      {
        moduleNumber: 1,
        title: "Module 1: IoT Hardware, Sensor Interfacing & OLED Displays",
        duration: "Day 1 (4 Hours)",
        topics: [
          "IoT Architecture: Perception, Network, Application Layers",
          "Interfacing Digital/Analog Sensors: Temperature, Humidity, Air Quality",
          "I2C Protocol & OLED Display Graphics Formatting",
          "Relay Control Circuits & Electrical Safety Protocols"
        ],
        project: "Lab 1: Smart Environmental Monitoring Node with OLED Display"
      },
      {
        moduleNumber: 2,
        title: "Module 2: Cloud Protocols (MQTT/HTTP) & Telemetry Dashboards",
        duration: "Day 2 (4 Hours)",
        topics: [
          "Publish-Subscribe Protocol: MQTT Broker vs REST HTTP APIs",
          "Connecting ESP32 to HiveMQ / Adafruit IO Cloud Brokers",
          "Designing Web & Mobile Dashboards for Real-Time Telemetry Data",
          "Automated Threshold Alerts (Email/WhatsApp via Webhooks)"
        ],
        project: "Capstone: Industrial Smart Factory Telemetry & Automated AC Relay Trigger"
      }
    ]
  },

  {
    id: "prog-cybersecurity",
    title: "Cyber Security, Ethical Hacking & Cloud Vulnerability Assessment",
    code: "HYPER-SEC-401",
    department: "Cyber Security & Cloud",
    category: "Cyber Security",
    duration: "2-Day / 3-Day Hands-on Bootcamp",
    level: "Beginner to Intermediate",
    targetBatch: "2nd, 3rd & 4th Year B.Tech / BCA / MCA",
    desc: "Hands-on offensive and defensive cybersecurity training. Learn penetration testing, web app vulnerabilities (OWASP Top 10), network traffic analysis with Wireshark, and Linux security.",
    imageIcon: "🔒",
    prerequisites: "Basic networking & Linux commands",
    hardwareKit: [
      "Kali Linux Cloud Virtual Machine Environment",
      "Metasploitable & OWASP Juice Shop Target Sandboxes",
      "Wireshark Capture Files & Security Tooling Package"
    ],
    highlights: [
      "Ethical Hacking in an isolated safe sandbox environment",
      "OWASP Top 10 Web Vulnerabilities (SQLi, XSS, CSRF, IDOR)",
      "Wireshark Network Packet Sniffing & Analysis",
      "Capture The Flag (CTF) Competition included",
      "Industry Certified Cybersecurity Training Certificate"
    ],
    modules: [
      {
        moduleNumber: 1,
        title: "Module 1: Linux Fundamentals, Networking & Reconnaissance",
        duration: "Day 1 (4 Hours)",
        topics: [
          "Linux Command Line Mastery & Kali Linux Toolsuite",
          "TCP/IP Suite, Subnetting, OSI Model & Port Scanning with Nmap",
          "Information Gathering & OSINT (Open Source Intelligence)",
          "Wireshark Packet Analysis & Protocol Deconstruction"
        ],
        project: "Lab 1: Network Reconnaissance & Port Vulnerability Mapping"
      },
      {
        moduleNumber: 2,
        title: "Module 2: Web Vulnerabilities (OWASP Top 10) & CTF Challenge",
        duration: "Day 2 (4 Hours)",
        topics: [
          "SQL Injection (SQLi) Exploitation & Defense",
          "Cross-Site Scripting (XSS) & Session Hijacking",
          "Password Cracking & Hydra/Burp Suite Fundamentals",
          "Live Institutional Capture The Flag (CTF) Competition"
        ],
        project: "Capstone: Vulnerability Assessment Report & Institutional CTF"
      }
    ]
  },

  {
    id: "prog-ev-battery",
    title: "Electric Vehicle (EV) Systems & Battery Management (BMS) Design",
    code: "HYPER-EV-501",
    department: "Electronics & Electrical",
    category: "EV & Green Tech",
    duration: "3-Day Bootcamp / 5-Day VAC",
    level: "Intermediate",
    targetBatch: "3rd & 4th Year B.Tech (EEE/ECE/MECH/AUTO)",
    desc: "In-depth engineering workshop covering Lithium-ion cell chemistries, Battery Management System (BMS) hardware design, CAN Bus communication, and EV powertrain motor controllers.",
    imageIcon: "🔌",
    prerequisites: "Basic circuit theory and electronics",
    hardwareKit: [
      "LiFePO4 / Li-ion Battery Testing Setup",
      "Hardware BMS Board with Balancing Circuitry",
      "CAN Bus Transceiver Module (MCP2515)",
      "Digital Multimeters & Electronic Load Testers"
    ],
    highlights: [
      "Lithium Cell Testing, State-of-Charge (SOC) Estimation Algorithms",
      "BMS Hardware Circuitry & Passive/Active Cell Balancing",
      "CAN Bus Automotive Communication Protocol Interfacing",
      "Thermal Runaway Prevention & Safety Protocols",
      "Certificate in EV Powertrain & BMS Engineering"
    ],
    modules: [
      {
        moduleNumber: 1,
        title: "Module 1: EV Architecture & Battery Pack Engineering",
        duration: "Day 1 (4 Hours)",
        topics: [
          "EV Powertrain Overview: Motors, Inverters, Battery Packs",
          "Li-Ion Cell Chemistries (NMC vs LiFePO4), Energy Density & C-Ratings",
          "Series/Parallel Cell Configurations & Spot Welding Techniques",
          "Cell Voltage, Current & Temperature Sensing Circuits"
        ],
        project: "Lab 1: Lithium Cell Characterization & SOC Curve Plotting"
      },
      {
        moduleNumber: 2,
        title: "Module 2: BMS Hardware, Cell Balancing & CAN Bus Protocol",
        duration: "Day 2 (4 Hours)",
        topics: [
          "BMS Architecture: Master-Slave Units, Protection MOSFETs",
          "Passive vs Active Cell Balancing Algorithms",
          "Automotive CAN Bus (ISO 11898) Frame Structure & Transceivers",
          "Interfacing Microcontrollers with CAN Bus Transceiver (MCP2515)"
        ],
        project: "Capstone: Functional 4S Li-Ion BMS with CAN Bus Telemetry"
      }
    ]
  }
];
