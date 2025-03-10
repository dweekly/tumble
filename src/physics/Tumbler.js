import * as CANNON from 'cannon-es';
import { TUMBLER_RADIUS, RESTITUTION, FRICTION, BASE_RPM, ROTATION_CHANGE_INTERVAL, ROTATION_TRANSITION_TIME } from '../utils/constants';

export default class Tumbler {
  constructor(world) {
    this.world = world;
    this.isRotating = false;
    
    // Calculate base rotation speed
    // BASE_RPM = revolutions per minute
    // Convert to radians/second
    this.baseRotationSpeed = (BASE_RPM * 2 * Math.PI) / 60;
    
    // Initialize rotation settings
    this.initializeRotation();
    
    // Set up automatic rotation changes
    this.lastRotationChangeTime = 0;
    this.transitionStartTime = 0;
    this.transitionProgress = 1; // Start with completed transition
    this.oldRotationAxes = null;
    this.newRotationAxes = null;
    
    this.createBody();
    this.addToWorld();
  }
  
  // Generate a random set of rotation axes with varying speeds
  generateRandomRotation() {
    const generateRandomAxis = () => {
      // Generate a random unit vector direction
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      const z = Math.random() * 2 - 1;
      
      // Convert to unit vector
      const length = Math.sqrt(x*x + y*y + z*z);
      return new CANNON.Vec3(x/length, y/length, z/length);
    };
    
    const generateRandomSpeed = () => {
      // Generate a speed between 0.5x and 1.5x the base rotation speed
      return this.baseRotationSpeed * (0.5 + Math.random());
    };
    
    // Generate 3 random rotation axes with varying speeds
    return [
      { axis: generateRandomAxis(), speed: generateRandomSpeed() },
      { axis: generateRandomAxis(), speed: generateRandomSpeed() },
      { axis: generateRandomAxis(), speed: generateRandomSpeed() }
    ];
  }
  
  // Initialize rotation with random axes
  initializeRotation() {
    this.rotationAxes = this.generateRandomRotation();
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

  // Check if it's time to change rotation
  checkRotationChange(currentTime) {
    if (currentTime - this.lastRotationChangeTime > ROTATION_CHANGE_INTERVAL) {
      // Start a new rotation transition
      this.lastRotationChangeTime = currentTime;
      this.transitionStartTime = currentTime;
      this.transitionProgress = 0;
      
      this.oldRotationAxes = this.rotationAxes;
      this.newRotationAxes = this.generateRandomRotation();
    }
  }
  
  // Interpolate between two rotation settings
  interpolateRotations(progress) {
    // If no transition is in progress, return current axes
    if (!this.oldRotationAxes || !this.newRotationAxes || progress >= 1) {
      return this.rotationAxes;
    }
    
    // Create interpolated rotation axes
    return this.oldRotationAxes.map((oldRotation, index) => {
      const newRotation = this.newRotationAxes[index];
      
      // Interpolate axis - using SLERP (Spherical Linear Interpolation) for smooth rotation
      const oldAxis = oldRotation.axis;
      const newAxis = newRotation.axis;
      
      // Calculate the dot product between the axes
      const dot = oldAxis.dot(newAxis);
      
      // If axes are nearly parallel, use simple linear interpolation
      if (Math.abs(dot) > 0.9999) {
        return {
          axis: new CANNON.Vec3(
            oldAxis.x + progress * (newAxis.x - oldAxis.x),
            oldAxis.y + progress * (newAxis.y - oldAxis.y),
            oldAxis.z + progress * (newAxis.z - oldAxis.z)
          ).unit(), // Normalize to ensure it's a unit vector
          speed: oldRotation.speed + progress * (newRotation.speed - oldRotation.speed)
        };
      }
      
      // For non-parallel axes, use SLERP
      // Calculate the angle between the vectors
      const theta = Math.acos(dot);
      const sinTheta = Math.sin(theta);
      
      // Calculate interpolation factors
      const factorOld = Math.sin((1 - progress) * theta) / sinTheta;
      const factorNew = Math.sin(progress * theta) / sinTheta;
      
      // Interpolate the axis using SLERP
      const interpolatedAxis = new CANNON.Vec3(
        oldAxis.x * factorOld + newAxis.x * factorNew,
        oldAxis.y * factorOld + newAxis.y * factorNew,
        oldAxis.z * factorOld + newAxis.z * factorNew
      ).unit(); // Normalize again to ensure it's a unit vector
      
      // Linearly interpolate the speed
      const interpolatedSpeed = oldRotation.speed + progress * (newRotation.speed - oldRotation.speed);
      
      return { axis: interpolatedAxis, speed: interpolatedSpeed };
    });
  }
  
  update(dt, currentTime = Date.now()) {
    if (this.isRotating) {
      // Check if it's time to change rotation
      this.checkRotationChange(currentTime);
      
      // Update transition progress if a transition is ongoing
      if (this.transitionProgress < 1) {
        this.transitionProgress = Math.min(1, (currentTime - this.transitionStartTime) / ROTATION_TRANSITION_TIME);
        
        // If transition just completed, update the current rotation
        if (this.transitionProgress >= 1) {
          this.rotationAxes = this.newRotationAxes;
        }
      }
      
      // Get the current interpolated rotation axes
      const currentRotationAxes = this.interpolateRotations(this.transitionProgress);
      
      // Apply rotation around all axes
      let finalQuaternion = this.body.quaternion.clone();
      
      // Apply rotations for each axis
      for (const rotation of currentRotationAxes) {
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