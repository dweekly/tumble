import * as CANNON from 'cannon-es';
import Ball from '../physics/Ball';
import PhysicsWorld from '../physics/World';
import { BALL_RADIUS, GRAVITY } from '../utils/constants';

describe('Physics Engine Tests', () => {
  let world;
  
  beforeEach(() => {
    world = new PhysicsWorld();
  });
  
  test('World initializes with correct gravity', () => {
    expect(world.world.gravity.y).toBe(GRAVITY);
  });
  
  test('World creates correct number of balls', () => {
    const balls = world.getBalls();
    expect(balls.length).toBe(8);
  });
  
  test('Balls are inside the tumbler', () => {
    const balls = world.getBalls();
    const tumblerPosition = world.getTumbler().getPosition();
    
    for (const ball of balls) {
      const ballPosition = ball.getPosition();
      const distance = ballPosition.distanceTo(tumblerPosition);
      
      // Ball should be inside tumbler
      expect(distance).toBeLessThan(world.tumbler.body.shapes[0].boundingSphereRadius - BALL_RADIUS);
    }
  });
  
  test('Balls do not overlap initially', () => {
    const balls = world.getBalls();
    
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const distance = balls[i].getPosition().distanceTo(balls[j].getPosition());
        
        // Distance should be at least double the radius
        expect(distance).toBeGreaterThan(BALL_RADIUS * 2 - 0.01); // Small epsilon for floating point
      }
    }
  });
  
  test('Ball physics properties are set correctly', () => {
    const cannonWorld = new CANNON.World();
    const position = new CANNON.Vec3(0, 0, 0);
    const ball = new Ball(position, cannonWorld);
    
    expect(ball.body.mass).toBe(1);
    expect(ball.body.shapes[0].radius).toBe(BALL_RADIUS);
    expect(ball.body.material.restitution).toBe(0.7);
    expect(ball.body.material.friction).toBe(0.3);
  });
  
  test('Tumbler rotation toggles correctly', () => {
    // Initially not rotating
    expect(world.tumbler.isRotating).toBe(false);
    
    // Toggle on
    const isRotatingOn = world.toggleTumblerRotation();
    expect(isRotatingOn).toBe(true);
    expect(world.tumbler.isRotating).toBe(true);
    
    // Toggle off
    const isRotatingOff = world.toggleTumblerRotation();
    expect(isRotatingOff).toBe(false);
    expect(world.tumbler.isRotating).toBe(false);
  });
  
  test('Reset creates new balls', () => {
    const originalBalls = world.getBalls();
    world.reset();
    const newBalls = world.getBalls();
    
    // Should have same number of balls
    expect(newBalls.length).toBe(originalBalls.length);
    
    // Should be different ball instances
    expect(newBalls).not.toBe(originalBalls);
  });
});