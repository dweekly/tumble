import * as CANNON from 'cannon-es';
import Ball from '../physics/Ball';
import PhysicsWorld from '../physics/World';
import { BALL_RADIUS } from '../utils/constants';

describe('Collision Detection Tests', () => {
  let world;
  
  beforeEach(() => {
    world = new PhysicsWorld();
  });
  
  test('Ball to ball collision detection works', () => {
    const cannonWorld = new CANNON.World();
    
    // Create two balls close to each other
    const ball1 = new Ball(new CANNON.Vec3(0, 0, 0), cannonWorld);
    const ball2 = new Ball(new CANNON.Vec3(BALL_RADIUS * 1.9, 0, 0), cannonWorld);
    
    // They should be intersecting
    expect(ball1.intersects(ball2)).toBe(true);
    
    // Move second ball away
    ball2.setPosition(BALL_RADIUS * 3, 0, 0);
    
    // They should not be intersecting now
    expect(ball1.intersects(ball2)).toBe(false);
  });
  
  test('Ball stays inside tumbler after physics step', () => {
    // Step the physics world forward
    for (let i = 0; i < 100; i++) {
      world.update();
    }
    
    // Check all balls are still inside the tumbler
    const balls = world.getBalls();
    const tumblerPosition = world.getTumbler().getPosition();
    const tumblerRadius = world.tumbler.body.shapes[0].boundingSphereRadius;
    
    for (const ball of balls) {
      const ballPosition = ball.getPosition();
      const distance = ballPosition.distanceTo(tumblerPosition);
      
      // Ball should still be inside tumbler with some margin
      expect(distance).toBeLessThan(tumblerRadius - BALL_RADIUS + 0.1);
    }
  });
  
  test('Ball does not pass through tumbler wall', () => {
    const balls = world.getBalls();
    const firstBall = balls[0];
    const tumblerPosition = world.getTumbler().getPosition();
    
    // Get direction from tumbler center to ball
    const direction = firstBall.getPosition().vsub(tumblerPosition);
    direction.normalize();
    
    // Move ball close to wall
    const nearWallPosition = tumblerPosition.vadd(
      direction.scale(world.tumbler.body.shapes[0].boundingSphereRadius - BALL_RADIUS - 0.1)
    );
    firstBall.setPosition(nearWallPosition.x, nearWallPosition.y, nearWallPosition.z);
    
    // Apply force outward
    const force = direction.scale(1000); // Strong force outward
    firstBall.applyForce(force);
    
    // Run multiple physics steps
    for (let i = 0; i < 30; i++) {
      world.update();
    }
    
    // Check that ball is still inside (with small margin)
    const finalPosition = firstBall.getPosition();
    const distance = finalPosition.distanceTo(tumblerPosition);
    
    // Ball should still be inside tumbler (or just slightly outside due to numerical precision)
    expect(distance).toBeLessThan(world.tumbler.body.shapes[0].boundingSphereRadius - BALL_RADIUS + 0.15);
  });
  
  test('Tumbler rotation does not cause balls to escape', () => {
    // Enable tumbler rotation
    world.toggleTumblerRotation();
    
    // Run multiple physics steps with rotation
    for (let i = 0; i < 100; i++) {
      world.update();
    }
    
    // Check all balls are still inside the tumbler
    const balls = world.getBalls();
    const tumblerPosition = world.getTumbler().getPosition();
    const tumblerRadius = world.tumbler.body.shapes[0].boundingSphereRadius;
    
    for (const ball of balls) {
      const ballPosition = ball.getPosition();
      const distance = ballPosition.distanceTo(tumblerPosition);
      
      // Ball should still be inside tumbler
      expect(distance).toBeLessThan(tumblerRadius - BALL_RADIUS + 0.1);
    }
  });
});