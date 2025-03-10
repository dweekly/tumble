import * as CANNON from 'cannon-es';
import { BALL_RADIUS, BALL_MASS, RESTITUTION, FRICTION } from '../utils/constants';

export default class Ball {
  constructor(position, world) {
    this.createBody(position);
    this.addToWorld(world);
  }

  createBody(position) {
    // Create the physics body
    this.body = new CANNON.Body({
      mass: BALL_MASS,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      shape: new CANNON.Sphere(BALL_RADIUS),
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
    return distance < (BALL_RADIUS + BALL_RADIUS);
  }
}