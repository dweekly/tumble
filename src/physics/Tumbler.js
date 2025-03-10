import * as CANNON from 'cannon-es';
import { TUMBLER_RADIUS, RESTITUTION, FRICTION } from '../utils/constants';

export default class Tumbler {
  constructor(world) {
    this.world = world;
    this.isRotating = false;
    
    // 4 RPM = 4 revolutions per minute
    // = 4 * (2π radians) / 60 seconds
    // ≈ 0.419 radians per second
    this.rotationSpeed = (4 * 2 * Math.PI) / 60; // radians per second
    
    // Rotation axes with different speeds for more natural motion
    this.rotationAxes = [
      { axis: new CANNON.Vec3(1, 0, 0), speed: this.rotationSpeed * 0.7 }, // X-axis
      { axis: new CANNON.Vec3(0, 1, 0), speed: this.rotationSpeed },       // Y-axis
      { axis: new CANNON.Vec3(0, 0, 1), speed: this.rotationSpeed * 0.5 }  // Z-axis
    ];
    
    this.createBody();
    this.addToWorld();
  }

  createBody() {
    // Instead of creating a complex dodecahedron with potential normal issues,
    // we'll create a set of planes that form the interior of the tumbler
    this.body = new CANNON.Body({
      mass: 0, // Static body
      type: CANNON.Body.STATIC,
      material: new CANNON.Material({ restitution: RESTITUTION, friction: FRICTION })
    });

    // Create a simpler approximation with box shapes for the tumbler
    // This creates an interior chamber by positioning planes facing inward
    const boxSize = TUMBLER_RADIUS * 1.8; // Slightly larger than the radius
    const halfBoxSize = boxSize / 2;
    const planeThickness = 0.2;

    // Create six planes facing inward to form a cube
    // Bottom plane (+Y normal)
    const bottomShape = new CANNON.Box(new CANNON.Vec3(halfBoxSize, planeThickness, halfBoxSize));
    this.body.addShape(bottomShape, new CANNON.Vec3(0, -halfBoxSize, 0));

    // Top plane (-Y normal)
    const topShape = new CANNON.Box(new CANNON.Vec3(halfBoxSize, planeThickness, halfBoxSize));
    this.body.addShape(topShape, new CANNON.Vec3(0, halfBoxSize, 0));

    // Front plane (+Z normal)
    const frontShape = new CANNON.Box(new CANNON.Vec3(halfBoxSize, halfBoxSize, planeThickness));
    this.body.addShape(frontShape, new CANNON.Vec3(0, 0, -halfBoxSize));

    // Back plane (-Z normal)
    const backShape = new CANNON.Box(new CANNON.Vec3(halfBoxSize, halfBoxSize, planeThickness));
    this.body.addShape(backShape, new CANNON.Vec3(0, 0, halfBoxSize));

    // Left plane (+X normal)
    const leftShape = new CANNON.Box(new CANNON.Vec3(planeThickness, halfBoxSize, halfBoxSize));
    this.body.addShape(leftShape, new CANNON.Vec3(-halfBoxSize, 0, 0));

    // Right plane (-X normal)
    const rightShape = new CANNON.Box(new CANNON.Vec3(planeThickness, halfBoxSize, halfBoxSize));
    this.body.addShape(rightShape, new CANNON.Vec3(halfBoxSize, 0, 0));

    // Add additional diagonal planes to create a more interesting shape
    // These help approximate a dodecahedron by cutting the corners
    const cornerSize = halfBoxSize * 0.8;
    const cornerOffset = halfBoxSize * 0.5;
    const cornerThickness = planeThickness;

    // Corner planes (8 corners of a cube)
    const cornerDirections = [
      new CANNON.Vec3(1, 1, 1),
      new CANNON.Vec3(1, 1, -1),
      new CANNON.Vec3(1, -1, 1),
      new CANNON.Vec3(1, -1, -1),
      new CANNON.Vec3(-1, 1, 1),
      new CANNON.Vec3(-1, 1, -1),
      new CANNON.Vec3(-1, -1, 1),
      new CANNON.Vec3(-1, -1, -1)
    ];

    // Add corner planes
    cornerDirections.forEach(dir => {
      const cornerShape = new CANNON.Box(new CANNON.Vec3(cornerSize, cornerSize, cornerThickness));
      
      // Position and rotate to face inward at each corner
      const position = new CANNON.Vec3(
        dir.x * cornerOffset,
        dir.y * cornerOffset,
        dir.z * cornerOffset
      );
      
      // Calculate rotation to face inward
      const normal = dir.clone().scale(-1).unit();
      const q = new CANNON.Quaternion();
      q.setFromVectors(new CANNON.Vec3(0, 0, 1), normal);
      
      this.body.addShape(cornerShape, position, q);
    });
  }

  addToWorld() {
    this.world.addBody(this.body);
  }

  toggleRotation() {
    this.isRotating = !this.isRotating;
    return this.isRotating;
  }

  update(dt) {
    if (this.isRotating) {
      // Apply rotation around all three axes
      let finalQuaternion = this.body.quaternion.clone();
      
      // Apply rotations for each axis
      for (const rotation of this.rotationAxes) {
        const rotationAngle = rotation.speed * dt;
        const q = new CANNON.Quaternion();
        q.setFromAxisAngle(rotation.axis, rotationAngle);
        finalQuaternion = q.mult(finalQuaternion);
      }
      
      // Apply the combined rotation
      this.body.quaternion = finalQuaternion;
    }
  }

  getPosition() {
    return this.body.position;
  }

  getQuaternion() {
    return this.body.quaternion;
  }
}