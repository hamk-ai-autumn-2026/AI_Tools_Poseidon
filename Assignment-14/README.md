# Neon Strike: Cyberspace Defender

Neon Strike is a high-paced, cyberpunk-themed HTML5 Canvas space shooter. Built from scratch using modern web technologies, it features object-oriented game mechanics, a robust particle physics system, mathematical collision detection, and persistent local storage for high scores.

## Features Exceeding Base Requirements
*   **Object-Oriented Architecture:** Game entities (Player, Enemy, Projectile, Particle) are strictly managed via JavaScript Classes.
*   **Dynamic Scaling Difficulty:** The spawn rate and enemy velocity incrementally increase based on the player's active score.
*   **Particle Physics System:** Instead of standard sprites, destroyed enemies shatter into mathematically calculated particle bursts using friction and alpha decay.
*   **Data Persistence:** Utilizes the browser's `localStorage` API to save and retrieve the user's highest score between sessions.
*   **Responsive Input:** Supports both mouse coordinates for desktop and touch-events for mobile gameplay.

## How to Run
No build steps or server required. 
1. Clone this repository.
2. Open `index.html` in any modern web browser.

---

### AI Agents and LLMs Used
For this project, **Google Gemini** was utilized as an AI pair-programmer. Gemini assisted in:
*   Structuring the initial HTML5 Canvas render loop (`requestAnimationFrame`).
*   Drafting the boilerplate for the object-oriented JavaScript classes.
*   Implementing the AABB (Axis-Aligned Bounding Box) mathematical collision detection between projectiles and enemies.
*   Refining the CSS styling to achieve a specific "neon/cyberpunk" visual aesthetic using custom glowing shadows.