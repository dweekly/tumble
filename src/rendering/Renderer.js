import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BALL_COLORS, BALL_RADIUS, TUMBLER_RADIUS } from '../utils/constants';

export default class Renderer {
  constructor(physicsWorld, container) {
    this.physicsWorld = physicsWorld;
    this.container = container;
    
    this.setupScene();
    this.setupCamera();
    this.setupLights();
    this.setupControls();
    this.createMeshes();
    
    // Start animation loop
    this.animate();
  }
  
  setupScene() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111111);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    
    // Add to DOM
    this.container.appendChild(this.renderer.domElement);
    
    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
  }
  
  setupCamera() {
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.camera.position.set(0, 10, 15);
    this.camera.lookAt(0, 0, 0);
  }
  
  setupLights() {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    
    const d = 30;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    
    this.scene.add(directionalLight);
    
    // Add point light inside tumbler for better illumination
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 0, 0);
    this.scene.add(pointLight);
  }
  
  setupControls() {
    // Add orbit controls for camera
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
  }
  
  createMeshes() {
    // Create ball meshes
    this.ballMeshes = [];
    const balls = this.physicsWorld.getBalls();
    
    const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
    
    for (let i = 0; i < balls.length; i++) {
      const color = BALL_COLORS[i % BALL_COLORS.length];
      const ballMaterial = new THREE.MeshPhongMaterial({ 
        color, 
        shininess: 30,
        specular: 0x444444
      });
      
      const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
      ballMesh.castShadow = true;
      this.scene.add(ballMesh);
      this.ballMeshes.push(ballMesh);
    }
    
    // Create tumbler mesh
    this.createTumblerMesh();
  }
  
  createTumblerMesh() {
    // We'll create a group to hold all our tumbler meshes
    this.tumblerMesh = new THREE.Group();
    this.scene.add(this.tumblerMesh);
    
    // Create a box to represent the tumbler
    const boxSize = TUMBLER_RADIUS * 1.8;
    const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    
    // Create a transparent material for the box
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide, // Render backfaces for inside view
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    
    // Create the box with backside rendering for interior view
    const boxMesh = new THREE.Mesh(boxGeometry, material);
    boxMesh.receiveShadow = true;
    this.tumblerMesh.add(boxMesh);
    
    // Add wireframe for better visibility
    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(boxGeometry),
      new THREE.LineBasicMaterial({ color: 0x888888 })
    );
    this.tumblerMesh.add(wireframe);
    
    // Add corner pieces to create a more interesting shape
    // Create a dodecahedron to visualize the target shape
    const dodecGeometry = new THREE.DodecahedronGeometry(TUMBLER_RADIUS * 0.95, 0);
    const dodecWireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(dodecGeometry),
      new THREE.LineBasicMaterial({ color: 0x44aaff, linewidth: 2 })
    );
    this.tumblerMesh.add(dodecWireframe);
  }
  
  updateMeshes() {
    // Update ball positions
    const balls = this.physicsWorld.getBalls();
    
    for (let i = 0; i < balls.length; i++) {
      const position = balls[i].getPosition();
      const quaternion = balls[i].getQuaternion();
      
      this.ballMeshes[i].position.copy(position);
      this.ballMeshes[i].quaternion.copy(quaternion);
    }
    
    // Update tumbler position
    const tumbler = this.physicsWorld.getTumbler();
    const tumblerQuaternion = tumbler.getQuaternion();
    const tumblerPosition = tumbler.getPosition();
    
    this.tumblerMesh.position.copy(tumblerPosition);
    this.tumblerMesh.quaternion.copy(tumblerQuaternion);
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Update controls
    this.controls.update();
    
    // Update meshes to match physics bodies
    this.updateMeshes();
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
  
  onWindowResize() {
    // Update camera aspect ratio
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    
    // Update renderer size
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}