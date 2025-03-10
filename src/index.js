import PhysicsWorld from './physics/World';
import Renderer from './rendering/Renderer';
import { TIMESTEP } from './utils/constants';

class TumbleSimulation {
  constructor() {
    this.init();
    this.setupEventListeners();
    this.lastTime = 0;
    this.animate();
  }

  init() {
    // Create physics world
    this.physicsWorld = new PhysicsWorld();
    
    // Create renderer
    const container = document.getElementById('simulation-container');
    this.renderer = new Renderer(this.physicsWorld, container);
  }

  setupEventListeners() {
    // Reset button
    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', () => {
      this.physicsWorld.reset();
    });
    
    // Toggle rotation button
    const toggleButton = document.getElementById('toggle-rotation');
    toggleButton.addEventListener('click', () => {
      const isRotating = this.physicsWorld.toggleTumblerRotation();
      toggleButton.textContent = isRotating ? 
        'Stop Tumbler Rotation' : 
        'Start Tumbler Rotation (4 RPM)';
    });
    
    // Start with rotation enabled by default
    this.physicsWorld.toggleTumblerRotation();
    toggleButton.textContent = 'Stop Tumbler Rotation';
  }

  animate(time = 0) {
    requestAnimationFrame((t) => this.animate(t));
    
    // Calculate time delta
    const dt = Math.min((time - this.lastTime) / 1000, 0.1); // Cap at 0.1s to avoid large jumps
    this.lastTime = time;
    
    // Update physics (if enough time has passed)
    if (dt > 0) {
      // Use current time for rotation transitions
      this.physicsWorld.update(dt, time);
    }
  }
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  new TumbleSimulation();
});