import * as CANNON from 'cannon-es';
import Ball from './Ball';
import Tumbler from './Tumbler';
import { 
  NUM_BALLS, 
  GRAVITY, 
  TIMESTEP, 
  MAX_SUBSTEPS,
  BALL_RADIUS, 
  TUMBLER_RADIUS
} from '../utils/constants';

export default class PhysicsWorld {
  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, GRAVITY, 0)
    });
    
    // Create the tumbler
    this.tumbler = new Tumbler(this.world);
    
    // Create balls
    this.balls = this.createBalls();
    
    // Set up collision detection
    this.setupCollisionDetection();
  }
  
  createBalls() {
    const balls = [];
    const tumblerCenter = this.tumbler.getPosition();
    
    // Calculate safe starting positions inside the tumbler
    // We want to avoid balls starting in collision with each other
    // and keep them away from corners and edges
    for (let i = 0; i < NUM_BALLS; i++) {
      let position;
      let valid = false;
      let attempts = 0;
      
      // Try to find a valid position that doesn't collide with other balls
      // and is well inside the tumbler
      while (!valid && attempts < 100) {
        attempts++;
        
        // Significantly reduce the safe radius to keep balls well away from edges
        // This prevents them from getting stuck in corners or edges
        const safeRadius = TUMBLER_RADIUS * 0.4; // Reduced from 0.6 to 0.4
        
        // Generate random position near the center
        position = new CANNON.Vec3(
          (Math.random() * 2 - 1) * safeRadius,
          (Math.random() * 2 - 1) * safeRadius,
          (Math.random() * 2 - 1) * safeRadius
        ).vadd(tumblerCenter);
        
        // Check if this position is valid (not colliding with other balls)
        valid = true;
        
        // Check distance from each existing ball
        for (let j = 0; j < balls.length; j++) {
          const dist = position.distanceTo(balls[j].getPosition());
          if (dist < BALL_RADIUS * 2.5) { // Increased margin for safer placement
            valid = false;
            break;
          }
        }
        
        // Also check distance from the center to ensure balls aren't too close to each other
        // when starting with an empty container
        if (valid && balls.length === 0 && i > 0) {
          // For the first few balls, ensure some minimum distance from the center
          // to avoid all balls piling in the middle
          const distFromCenter = position.distanceTo(tumblerCenter);
          if (distFromCenter < BALL_RADIUS * (i + 1) * 0.5) {
            valid = false;
          }
        }
      }
      
      // If we couldn't find a valid position after 100 attempts, place the ball
      // at the center with some vertical offset to prevent overlaps
      if (!valid) {
        position = new CANNON.Vec3(
          tumblerCenter.x,
          tumblerCenter.y + i * BALL_RADIUS * 2.5, // Stack vertically if needed
          tumblerCenter.z
        );
      }
      
      // Create and add the ball
      const ball = new Ball(position, this.world);
      balls.push(ball);
    }
    
    return balls;
  }
  
  setupCollisionDetection() {
    // Set up collision detection between balls
    this.world.addEventListener('postStep', () => {
      // Verify no balls have escaped the tumbler
      for (let ball of this.balls) {
        const pos = ball.getPosition();
        const distanceFromCenter = pos.distanceTo(this.tumbler.getPosition());
        const safeDistance = TUMBLER_RADIUS - BALL_RADIUS - 0.2; // Add extra safety margin
        
        // If a ball has somehow escaped or is too close to the edge, move it back inside
        if (distanceFromCenter > safeDistance) {
          const dir = pos.vsub(this.tumbler.getPosition());
          dir.normalize();
          
          // Move the ball back inside with additional safety margin
          const newPos = this.tumbler.getPosition().vadd(
            dir.scale(safeDistance * 0.9) // Move even further from the edge (90% of safe distance)
          );
          ball.setPosition(newPos.x, newPos.y, newPos.z);
          
          // Apply a stronger impulse inward and dampen velocity more
          ball.body.velocity.scale(0.3); // Reduce velocity more aggressively
          const impulse = dir.scale(-8); // Stronger impulse
          ball.body.applyImpulse(impulse, ball.body.position);
        }
        
        // Also check for balls that are moving too fast (can happen with physics glitches)
        const velocity = ball.body.velocity.length();
        const maxVelocity = 20; // Maximum allowed velocity
        
        if (velocity > maxVelocity) {
          // Scale down the velocity to prevent physics issues
          ball.body.velocity.scale(maxVelocity / velocity);
        }
        
        // Check for balls stuck in corners or edges (not moving much over time)
        // This requires tracking velocity over time, which would need additional state
        // For now, we'll rely on the safety margins and velocity limiting
      }
      
      // Check for balls intersecting with each other (shouldn't happen, but physics can glitch)
      // If they are, apply separation forces
      for (let i = 0; i < this.balls.length; i++) {
        for (let j = i + 1; j < this.balls.length; j++) {
          const ball1 = this.balls[i];
          const ball2 = this.balls[j];
          
          if (ball1.intersects(ball2)) {
            // Calculate separation vector
            const pos1 = ball1.getPosition();
            const pos2 = ball2.getPosition();
            const dir = pos1.vsub(pos2);
            const distance = dir.length();
            
            // If distance is zero, pick a random direction
            if (distance < 0.01) {
              dir.x = Math.random() * 2 - 1;
              dir.y = Math.random() * 2 - 1;
              dir.z = Math.random() * 2 - 1;
              dir.normalize();
            } else {
              dir.scale(1 / distance); // Normalize
            }
            
            // Separate the balls
            const minDistance = BALL_RADIUS * 2;
            const penetration = minDistance - distance;
            
            // Move balls apart and apply opposite impulses
            if (penetration > 0) {
              // Move apart
              const moveAmount = penetration * 0.5; // Half each way
              ball1.setPosition(
                pos1.x + dir.x * moveAmount,
                pos1.y + dir.y * moveAmount,
                pos1.z + dir.z * moveAmount
              );
              ball2.setPosition(
                pos2.x - dir.x * moveAmount,
                pos2.y - dir.y * moveAmount,
                pos2.z - dir.z * moveAmount
              );
              
              // Apply opposite impulses
              const impulse = 3; // Strength of separation
              ball1.body.applyImpulse(new CANNON.Vec3(dir.x, dir.y, dir.z).scale(impulse));
              ball2.body.applyImpulse(new CANNON.Vec3(-dir.x, -dir.y, -dir.z).scale(impulse));
            }
          }
        }
      }
    });
  }
  
  update(dt = TIMESTEP) {
    // Update tumbler rotation
    this.tumbler.update(dt);
    
    // Step the physics world forward
    this.world.step(dt, dt, MAX_SUBSTEPS);
  }
  
  reset() {
    // Remove existing balls
    for (let ball of this.balls) {
      this.world.removeBody(ball.body);
    }
    
    // Create new balls
    this.balls = this.createBalls();
  }
  
  toggleTumblerRotation() {
    return this.tumbler.toggleRotation();
  }
  
  getBalls() {
    return this.balls;
  }
  
  getTumbler() {
    return this.tumbler;
  }
}