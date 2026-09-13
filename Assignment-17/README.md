# GlobeTrotter AI — Project & Evaluation Benchmark Report

## 1. Project Overview
**GlobeTrotter AI** is a lightweight, interactive travel discovery and itinerary planning application. Built using modern web standards, it lets users explore popular travel destinations, view curated daily activities, calculate estimated trip expenses, and dynamically edit schedules on the fly.

### Key Features
* **Destination Discovery:** Visual grid highlighting global travel spots with quick metadata (country, overview).
* **Dynamic Itineraries:** City-specific daily activity breakdowns, timeline views, and itemized costs.
* **Interactive Budgeting:** Dynamic cost tracking that recalculates instantly when activities are removed.
* **Responsive Dashboard:** Dark-mode UI styled with modern layout practices and smooth visual elements.

---

## 2. Tech Stack & Architecture

* **Frontend Framework:** React 19 (JavaScript / TypeScript)
* **Build Tool:** Vite
* **Styling:** Tailwind CSS (utility-first dark slate palette)
* **Icons & Animation:** `lucide-react` icons and `framer-motion` transition effects
* **State Management:** Custom React Hook (`useItinerary`) for centralized data handling
* **Development Environment:** StackBlitz (Vite WebContainer) & Local Node.js environment

---

## 3. Project Structure

```text
src/
├── data/
│   └── destinations.js   # Centralized array of city objects & default itineraries
├── hooks/
│   └── useItinerary.js   # Custom hook for state management (city selection, activity deletion, budget totals)
├── App.tsx               # Primary UI component containing tab navigation and view rendering
└── main.tsx              # Application entry point