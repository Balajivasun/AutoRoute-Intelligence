# AutoRoute Intelligence: Real-Time AI Fleet Management System

![AutoRoute Banner](https://img.shields.io/badge/Status-Active-brightgreen)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-teal)
![MapLibre](https://img.shields.io/badge/MapLibre-GL%20JS-orange)
![Machine Learning](https://img.shields.io/badge/Algorithms-Explainable_AI-purple)

**AutoRoute Intelligence** is a high-fidelity, autonomous agentic fleet telemetry dashboard and command center. Developed as a highly advanced algorithmic traffic management prototype, it leverages asynchronous Python, Machine Learning paradigms, and bi-directional WebSockets to simulate and manage live vehicle pathing, predictive load balancing, and algorithmic anomaly resolution across an entire city network. 

By eliminating static dashboards and replacing them with a live "Cyber-Premium" Geographic Information System (GIS), AutoRoute acts as an intelligent overseer that actively optimizes mass transit networks in real time while offering complete transparency through Explainable AI (XAI).

---

## 🚀 Core Architectural Features

### 1. High-Fidelity Physical Route Simulation
Unlike standard coordinate-drifting algorithms, AutoRoute Intelligence employs deeply accurate geographic simulation logic. By mathematically interpreting geographic coordinates and integrating Open Source Routing Machine (OSRM) map topologies directly with OpenStreetMap (OSM) tile rendering, the fleet of 20 autonomous buses does not "fly" over buildings. Instead, the simulation enforces realistic cornering, physical road-snapping, and velocity degradation, giving the illusion of a perfectly synchronized, living city grid.

### 2. Explainable AI (XAI) & Trust Mechanisms
The "black box" problem of modern AI is solved via a dedicated **Explainable AI (XAI) Journal**. When the simulation's algorithmic agent detects an operational anomaly—such as a localized crowd surge or a mechanical breakdown—it doesn't just silently reroute vehicles. Instead, it triggers a live human-in-the-loop dashboard intervention. It outputs a highly transparent, human-readable logic breakdown, exposing its predictive confidence percentages, the constraint resolutions it used, and the direct revenue impact of its choice.

### 3. Bi-Directional WebSocket Telemetry
Polling is obsolete. AutoRoute uses `python-socketio` to construct a persistent, bi-directional event loop between the backend Python Command Core and the Javascript frontend. This allows the system to push massive arrays of vehicle metadata (including real-time velocity, exact lat/lng vectors, fuel reserve percentages, and ticket yields) instantly to the browser without a single refresh, resulting in a zero-latency, buttery-smooth command UI.

### 4. Predictive Surge Management & Dynamic Rebalancing
The fleet engine runs constant background probability checks, dynamically identifying underserved routes or historically validated demand spikes. Through predictive pre-positioning, the engine can autonomously extract buses from saturated corridors and inject them directly into bottleneck zones, mathematically proving an expected lift in fleet revenue efficiency prior to executing the command.

### 5. Commander Console Interventions
To maintain absolute control over the neural grid, administrators have access to an off-canvas **Manual Override Accordion Window**. This console allows humans to forcefully inject chaotic events into the simulation natively via FastAPI endpoints. Administrators can instantly trigger hardware failures, simulate sudden GPS jamming, or force a complete network rebalance at the press of a button, overriding the autonomous agent dynamically.

## 🛠 Technology Stack

- **Backend Logic Engine:** Python 3.10+, FastAPI, Uvicorn, Python-SocketIO, Asyncio
- **Frontend Presentation:** HTML5, CSS3 (Glassmorphism UI Patterns), Vanilla JavaScript
- **Geospatial Mapping:** MapLibre GL JS, OpenStreetMap Data, OSRM (GeoJSON Road Routing)
- **Database Persistence:** MySQL (PyMySQL)

---
*Developed to bridge the gap between abstract predictive AI algorithms and tangible, real-world transportation infrastructure.*
