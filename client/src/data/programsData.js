export const INITIAL_PROGRAMS = [
  {
    id: "prog-iot-architecture",
    title: "Internet of Things (IoT) Architecture & Cloud Integration",
    code: "ADIL-IOT-301",
    department: "Electronics & Computer Engineering",
    category: "IoT & Cloud",
    duration: "3-Day Intensive Bootcamp",
    level: "All Engineering Streams",
    targetBatch: "2nd, 3rd & 4th Year B.Tech / Diploma",
    pricePerStudent: "₹600 per student (₹200/day)",
    baselineBatch: "60 Registered Students (Negotiable for High Volume)",
    desc: "A targeted, skill-packed 3-day Internet of Things (IoT) workshop establishing core competencies in wireless embedded architecture, ESP32 Wi-Fi stacks, sensor-to-cloud data loops, open-source dashboards, and Adilitix Robotics' proprietary free IoT platform.",
    imageIcon: "⚡",
    prerequisites: "Basic programming logic and electronic circuit fundamentals",
    featuredTrack: "🐕 Unitree Go2 Pro Experience Track: Includes a complimentary interactive showcase & live field demo of our industrial quadruped robot, the Unitree Go2 Pro.",
    hardwareKit: [
      "ESP32 Dual-Core Dev Board with Wi-Fi & Bluetooth",
      "Multi-Sensor Suite (Temperature, Humidity, Ultrasonic, Light & Relay Outputs)",
      "Access to Adilitix Robotics' Proprietary Free IoT Platform",
      "Open-Source MQTT & HTTP Cloud Dashboards",
      "Breadboards, Jumper Harness & Power Supply Modules"
    ],
    highlights: [
      "🐕 Includes live field demo of the Unitree Go2 Pro Quadruped Robot",
      "🌐 Hands-on access to test Adilitix Robotics' own free proprietary IoT platform",
      "⚡ Native ESP32 Wi-Fi stack & low-latency localized wireless network engineering",
      "📊 Open-source MQTT channel routing, payload configuration & web dashboards",
      "📜 Corporate MSME Verified Certificate (Aadil S P, Founder & CEO)"
    ],
    modules: [
      {
        moduleNumber: 1,
        title: "Day 1: IoT Architectural Basics & Local Network Engineering",
        duration: "Day 1 (Full Practical Session)",
        topics: [
          "Demystifying core IoT terminology and sensor-to-cloud data loops",
          "Initializing embedded Wi-Fi communication stacks natively on ESP32 microcontroller",
          "Building low-latency localized wireless networks to trigger basic hardware output components",
          "GPIO configuration, analog-to-digital sensor calibration & PWM outputs"
        ],
        project: "Lab 1: Localized Wireless Sensor Node & Remote Hardware Relay Control"
      },
      {
        moduleNumber: 2,
        title: "Day 2: Testing Established, Open-Source & Proprietary Platforms",
        duration: "Day 2 (Full Practical Session)",
        topics: [
          "Practical benchmarking and structural stress-testing of market-standard IoT ecosystems",
          "Testing popular open-source platforms (MQTT Brokers, HTTP REST Endpoints)",
          "Exclusive hands-on access to test Adilitix Robotics' own free proprietary IoT platform",
          "Understanding live channel routing, payload structures, and telemetry configurations"
        ],
        project: "Lab 2: Multi-Platform Cloud Telemetry Data Streaming & Analytics Dashboard"
      },
      {
        moduleNumber: 3,
        title: "Day 3: Embedded IoT System Design & Global Deployment",
        duration: "Day 3 (Full Practical Session)",
        topics: [
          "End-to-end design of a functional smart system leveraging the ESP32",
          "Coding and integrating multi-tier communication logic",
          "Manipulating localized hardware outputs alongside real-time internet-driven wide-area network commands over web dashboards",
          "🐕 Unitree Go2 Pro Quadruped Robot live telemetry breakdown & field demonstration"
        ],
        project: "Capstone: Smart Wide-Area IoT Automation System + Unitree Go2 Pro Live Demo"
      }
    ]
  },

  {
    id: "prog-ai-computer-vision",
    title: "AI & Computer Vision for Robotics",
    code: "ADIL-AI-302",
    department: "Artificial Intelligence, CSE & Robotics",
    category: "AI & Robotics",
    duration: "3-Day Intensive Bootcamp",
    level: "Intermediate",
    targetBatch: "2nd, 3rd & 4th Year B.Tech (AI/DS/CSE/ECE/ROB)",
    pricePerStudent: "₹600 per student (₹200/day)",
    baselineBatch: "60 Registered Students (Negotiable for High Volume)",
    desc: "Intensive 3-day hands-on bootcamp on Python automation, OpenCV spatial processing, and Google MediaPipe tracking pipelines. Establishes core competencies in vision-guided automation, edge-compute neural landmark extraction, and direct cross-platform control loops.",
    imageIcon: "🧠",
    prerequisites: "Basic Python programming syntax",
    featuredTrack: "🐕 Unitree Go2 Pro Experience Track: Includes an exclusive technical breakdown of how edge-intelligence models, spatial tracking cameras, and hardware control frameworks interact dynamically to achieve real-time autonomous navigation.",
    hardwareKit: [
      "High-Frame-Rate USB Vision Sensors / Webcams",
      "Python OpenCV & Google MediaPipe Edge Intelligence Stack",
      "PySerial Hardware-Software Bridge Modules",
      "ESP32 Motor Driver Control Interfacing Units",
      "Adilitix Vision Analytics Sandbox"
    ],
    highlights: [
      "🐕 Includes live field interaction with the Unitree Go2 Pro Quadruped Robot",
      "👁️ OpenCV matrix structures, spatial filtering, color masking & contour detection",
      "🖐️ Google MediaPipe multi-point hand landmarking & facial skeletal pose estimation",
      "🔌 PySerial high-speed hardware-software control loops for robotics",
      "📜 Corporate MSME Verified Certificate (Aadil S P, Founder & CEO)"
    ],
    modules: [
      {
        moduleNumber: 1,
        title: "Day 1: Python Essentials & OpenCV Image Processing Foundations",
        duration: "Day 1 (Full Practical Session)",
        topics: [
          "Reviewing high-yield Python paradigms for real-time hardware data streams",
          "Introducing OpenCV matrix structures and camera video acquisition loops",
          "Writing image thresholding, spatial filtering, and color-space masking algorithms",
          "Structural contour detection and spatial boundary isolation math"
        ],
        project: "Lab 1: Real-Time Color & Shape Tracking Vision Filter Pipeline"
      },
      {
        moduleNumber: 2,
        title: "Day 2: AI Edge Intelligence & MediaPipe Landmark Extraction",
        duration: "Day 2 (Full Practical Session)",
        topics: [
          "Transitioning to lightweight neural network deployments at the edge",
          "Implementing Google MediaPipe pipelines for high-velocity real-time tracking",
          "Multi-point hand landmark identification and gesture recognition",
          "Facial boundary profiling and spatial skeletal pose estimation configurations"
        ],
        project: "Lab 2: Edge-AI Skeletal Pose & Hand Gesture Tracking Controller"
      },
      {
        moduleNumber: 3,
        title: "Day 3: Vision-Guided Control Loops & Smart System Automation",
        duration: "Day 3 (Full Practical Session)",
        topics: [
          "Bridging high-level visual math with low-level execution logic",
          "Designing a complete vision-directed hardware control system",
          "Mapping extraction coordinate variables to live automation triggers (gesture-controlled inputs / color-tracked item alignment)",
          "Milestone team showcase & 🐕 Unitree Go2 Pro Quadruped Robot live vision demo"
        ],
        project: "Capstone: Vision-Guided Gesture-Controlled Robotics System + Go2 Pro Demo"
      }
    ]
  },

  {
    id: "prog-additive-manufacturing-3d",
    title: "Additive Manufacturing & 3D Engineering",
    code: "ADIL-3D-303",
    department: "Mechanical, Mechatronics & Production",
    category: "3D Printing & Design",
    duration: "3-Day Skill-Packed Bootcamp",
    level: "All Engineering Streams",
    targetBatch: "1st, 2nd, 3rd & 4th Year B.Tech / Mechanical",
    pricePerStudent: "₹600 per student (₹200/day)",
    baselineBatch: "60 Registered Students (Negotiable for High Volume)",
    desc: "Intensive 3-day bootcamp shifting students from passive consumers to hardware creators by breaking down 3D visual design frameworks, parametric OpenSCAD script modeling, slicer calibration math, mechanical printer troubleshooting, and tech entrepreneurship.",
    imageIcon: "🖨️",
    prerequisites: "No prior 3D printing experience required",
    featuredTrack: "🖨️ On-Site Production Infrastructure: Adilitix Robotics brings up to three (3) industrial-grade 3D printers directly to the host campus! Includes 1-hour lecture on Tech Entrepreneurship & Unitree Go2 Pro showcase.",
    hardwareKit: [
      "3x Industrial-Grade FDM 3D Printers brought on-site by Adilitix Robotics",
      "PLA/PETG High-Precision Filament Spools & Nozzle Toolkits",
      "Parametric OpenSCAD & Tinkercad Design Sandboxes",
      "Slicing Software Suites (Cura / PrusaSlicer Calibration Profilers)",
      "Digital Calipers & Hardware Assembly Tools"
    ],
    highlights: [
      "🖨️ Adilitix Robotics brings up to 3 industrial 3D printers directly on campus",
      "📐 Code-based parametric 3D modeling via OpenSCAD & Tinkercad visual design",
      "⚙️ Slicer calibration math: layer heights, wall infills, nozzle temps & speeds",
      "💡 Specialized 1-hour lecture on Tech Entrepreneurship Opportunities & custom fabrication startups",
      "📜 Corporate MSME Verified Certificate (Aadil S P, Founder & CEO)"
    ],
    modules: [
      {
        moduleNumber: 1,
        title: "Day 1: 3D Modeling Foundations (Tinkercad to Parametric OpenSCAD)",
        duration: "Day 1 (Full Practical Session)",
        topics: [
          "Introduction to additive design thinking and rapid visual prototyping",
          "Rapid prototype creation using Tinkercad modeling engines",
          "Transitioning to advanced code-based parametric script modeling via OpenSCAD",
          "Programming dimensionally perfect industrial shapes and mechanical tolerances"
        ],
        project: "Lab 1: Parametric Script Modeling & Precision Enclosure Design"
      },
      {
        moduleNumber: 2,
        title: "Day 2: Advanced Additive Techniques & Slicer Mechanics",
        duration: "Day 2 (Full Practical Session)",
        topics: [
          "Deep dive into modern slicing engineering configurations",
          "Optimizing layer heights, structural wall infills, nozzle temperatures, and retractions",
          "Support structure generation, print speed math, and warping prevention",
          "G-code analysis, line width calculations, and material selection (PLA vs PETG vs ABS)"
        ],
        project: "Lab 2: Custom G-Code Generation & Multi-Printer Production Setup"
      },
      {
        moduleNumber: 3,
        title: "Day 3: Printer Maintenance, Troubleshooting & Tech Entrepreneurship",
        duration: "Day 3 (Full Practical Session)",
        topics: [
          "Hands-on operational printer maintenance procedures (nozzle clog resolutions, bed leveling diagnostics, extruder drive tuning)",
          "Specialized 1-hour lecture on Tech Entrepreneurship Opportunities",
          "Custom fabrication startup frameworks and direct hardware marketing paradigms",
          "Milestone physical print showcase & 🐕 Unitree Go2 Pro Quadruped Robot live demo"
        ],
        project: "Capstone: Physical 3D Part Production Showcase & Tech Startup Lecture"
      }
    ]
  },

  {
    id: "prog-fixed-robotics-arm",
    title: "Fixed Robotics & Mechatronics",
    code: "ADIL-ARM-304",
    department: "Mechatronics, ECE, EEE & Mechanical",
    category: "Robotics & Mechatronics",
    duration: "3-Day Intensive Bootcamp",
    level: "All Engineering Streams",
    targetBatch: "1st to 4th Year B.Tech / Diploma",
    pricePerStudent: "₹600 per student (₹200/day)",
    baselineBatch: "60 Registered Students (Negotiable for High Volume)",
    desc: "Generalized 3-day hardware-centric mechatronics bootcamp focusing entirely on the mechanics, kinematics, and electronic control interfaces of fixed automation, centering around the complete mechanical assembly and coordinate layout of a multi-axis desktop Robotic Gripper Arm.",
    imageIcon: "🦾",
    prerequisites: "Basic interest in mechanics & electronics",
    featuredTrack: "🐕 Unitree Go2 Pro Experience Track: Includes a comprehensive layout analysis of multi-sensor arrays, real-time spatial kinematics, and dynamic balance configurations of the Unitree Go2 Pro Quadruped Robot.",
    hardwareKit: [
      "Multi-Axis Desktop Robotic Gripper Arm Mechanical Kits",
      "High-Torque Servo Actuators with Metal Gears",
      "Dual-Axis Analog Joystick Module Controllers",
      "PWM Frequency Drivers & Microcontroller Shields",
      "Object Target Pick & Sort Hardware Stations"
    ],
    highlights: [
      "🦾 Structural assembly & kinematics of multi-axis desktop Robotic Gripper Arms",
      "🕹️ Mapping dual-axis Joystick Controls to mechatronic joint movements",
      "🎯 Automated pick-and-place sorting routines & mechanical boundary limits",
      "🐕 Unitree Go2 Pro Quadruped Robot spatial kinematics & balance demonstration",
      "📜 Corporate MSME Verified Certificate (Aadil S P, Founder & CEO)"
    ],
    modules: [
      {
        moduleNumber: 1,
        title: "Day 1: Actuation Fundamentals & Structural Assembly",
        duration: "Day 1 (Full Practical Session)",
        topics: [
          "Introduction to fixed multi-axis hardware mechanics and servo degrees of rotation",
          "Understanding Pulse Width Modulation (PWM) frequency tuning and servo signal timing",
          "Physical structural assembly of multi-axis robotic arm components and mechanical links",
          "Power distribution, current limits, and servo drive calibration"
        ],
        project: "Lab 1: Servo Actuator Calibration & Multi-Axis Arm Mechanical Assembly"
      },
      {
        moduleNumber: 2,
        title: "Day 2: Interface Mapping & Joystick Configurations",
        duration: "Day 2 (Full Practical Session)",
        topics: [
          "Integrating analog input controls (dual-axis joysticks, potentiometers)",
          "Writing configuration code to map dual-axis Joystick Controls directly to mechatronic joint movements",
          "Establishing mechanical physical boundary limits and soft-stop safety bounds",
          "Gripper actuation, clamping force calibration, and coordinate positioning"
        ],
        project: "Lab 2: Dual-Axis Joystick Manual Joint Manipulation & Gripper Control"
      },
      {
        moduleNumber: 3,
        title: "Day 3: Kinematic Sequences & Sorting Automation Challenges",
        duration: "Day 3 (Full Practical Session)",
        topics: [
          "Developing manual fluid manipulation routines and coordinate sequence recording",
          "Programming automation loops for localized target picking and precise object placement",
          "Final group milestone performance showcase handling speed, precision alignment, and automated sorting",
          "🐕 Unitree Go2 Pro Quadruped Robot live testing session & balance showcase"
        ],
        project: "Capstone: Automated Pick-and-Place Sorting Challenge + Go2 Pro Live Session"
      }
    ]
  },

  {
    id: "prog-foundational-autonomous-robotics",
    title: "Foundational Autonomous Robotics (Wheeled Rovers)",
    code: "ADIL-ROB-305",
    department: "Robotics, CSE, ECE, EEE & Mechanical",
    category: "Mobile Robotics",
    duration: "3-Day Intensive Bootcamp",
    level: "Beginner to Intermediate",
    targetBatch: "1st to 4th Year B.Tech / Diploma",
    pricePerStudent: "₹600 per student (₹200/day)",
    baselineBatch: "60 Registered Students (Negotiable for High Volume)",
    desc: "Generalized 3-day hardware-centric workshop developed specifically to introduce embedded systems and automated navigation to beginners. Focuses on the practical assembly, electronics, and logical programming of a 2-wheeled smart mobile rover platform transitioning to fully autonomous maze escape routines.",
    imageIcon: "🤖",
    prerequisites: "No prior robotics experience required",
    featuredTrack: "🐕 Unitree Go2 Pro Experience Track: Includes a complete technical breakdown of its multi-sensor arrays, kinematics, and dynamic balance configurations.",
    hardwareKit: [
      "2-Wheeled Smart Mobile Rover Chassis Kit & Motors",
      "ESP32 / Arduino Embedded Controller Boards",
      "Ultrasonic Radar Sensor Arrays & Mount Assemblies",
      "Dual H-Bridge Motor Driver Modules",
      "Rechargeable Li-Ion Battery Packs & Power Converters"
    ],
    highlights: [
      "🤖 Build, program & test a 2-wheeled smart mobile rover platform",
      "📡 Ultrasonic radar sensor arrays & real-time data logging diagnostics",
      "🧩 Closed-loop path orientation engineering & logical decision trees",
      "🏆 Final milestone live challenge: Autonomous Maze Escape Competition",
      "📜 Corporate MSME Verified Certificate (Aadil S P, Founder & CEO)"
    ],
    modules: [
      {
        moduleNumber: 1,
        title: "Day 1: Microcontrollers & Core Locomotion",
        duration: "Day 1 (Full Practical Session)",
        topics: [
          "Introduction to embedded platforms (ESP32/Arduino tools) and circuit prototyping basics",
          "Structural rover chassis assembly and wheel gear alignment",
          "Motor driver calibration firmware routines and PWM differential drive locomotion",
          "Electrical power distribution and battery voltage regulation"
        ],
        project: "Lab 1: Smart Rover Chassis Assembly & Differential Drive Locomotion"
      },
      {
        moduleNumber: 2,
        title: "Day 2: Sensor Architecture & Autonomous Obstacle Avoidance",
        duration: "Day 2 (Full Practical Session)",
        topics: [
          "Integrating ultrasonic 'radar' sensor arrays for distance measurement",
          "Real-time data logging diagnostics and sensor filtering",
          "Designing smart multi-conditional logic loops for autonomous boundary tracking",
          "Barrier avoidance algorithms and real-time obstacle avoidance state machines"
        ],
        project: "Lab 2: Ultrasonic Radar Sensor Integration & Boundary Obstacle Avoidance"
      },
      {
        moduleNumber: 3,
        title: "Day 3: Intelligent Path Navigation & The Maze Escape Challenge",
        duration: "Day 3 (Full Practical Session)",
        topics: [
          "Closed-loop path orientation engineering and heading stabilization",
          "Logical decision trees and obstacle navigation performance optimization",
          "Final milestone live challenge where student rovers navigate a complex maze track autonomously",
          "🐕 Unitree Go2 Pro Quadruped Robot live field interaction session"
        ],
        project: "Capstone: Autonomous Maze Escape Challenge + Go2 Pro Live Demo"
      }
    ]
  }
];
