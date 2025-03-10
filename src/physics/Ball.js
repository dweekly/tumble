import * as CANNON from 'cannon-es';
import { BASE_BALL_RADIUS, MIN_BALL_RADIUS, MAX_BALL_RADIUS, BALL_MASS, RESTITUTION, FRICTION } from '../utils/constants';

export default class Ball {
  constructor(position, world, radius = null) {
    // If no radius provided, use a random radius within the allowed range
    this.radius = radius || this.getRandomRadius();
    
    this.createBody(position);
    this.addToWorld(world);
  }
  
  getRandomRadius() {
    // Generate a random radius between MIN_BALL_RADIUS and MAX_BALL_RADIUS
    return MIN_BALL_RADIUS + Math.random() * (MAX_BALL_RADIUS - MIN_BALL_RADIUS);
  }

  createBody(position) {
    // Scale the mass based on the radius (mass proportional to volume)
    const scaledMass = BALL_MASS * Math.pow(this.radius / BASE_BALL_RADIUS, 3);
    
    // Create the physics body with the custom radius
    this.body = new CANNON.Body({
      mass: scaledMass,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      shape: new CANNON.Sphere(this.radius),
      material: new CANNON.Material({ restitution: RESTITUTION, friction: FRICTION })
    });
    
    // Prevent balls from spinning too fast
    this.body.angularDamping = 0.1;
    this.body.linearDamping = 0.01;
  }

  addToWorld(world) {
    world.addBody(this.body);
  }

  getPosition() {
    return this.body.position;
  }

  getQuaternion() {
    return this.body.quaternion;
  }

  // Used for testing
  setPosition(x, y, z) {
    this.body.position.set(x, y, z);
    this.body.previousPosition.set(x, y, z);
    this.body.initPosition.set(x, y, z);
    this.body.interpolatedPosition.set(x, y, z);
  }

  // Add force to the ball (for testing)
  applyForce(forceVector, worldPoint) {
    this.body.applyForce(forceVector, worldPoint || this.body.position);
  }

  // Check if this ball is intersecting with another ball
  intersects(otherBall) {
    const distance = this.body.position.distanceTo(otherBall.body.position);
    return distance < (this.radius + otherBall.radius);
  }
}