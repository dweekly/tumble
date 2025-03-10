// Mock for requestAnimationFrame
global.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0);
};

// Mock for window.innerWidth and window.innerHeight
global.innerWidth = 1024;
global.innerHeight = 768;

// Mock Three.js modules
jest.mock('three', () => ({
  Scene: jest.fn().mockImplementation(() => ({
    background: {},
    add: jest.fn()
  })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn(),
    aspect: 0,
    updateProjectionMatrix: jest.fn()
  })),
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setPixelRatio: jest.fn(),
    setSize: jest.fn(),
    shadowMap: { enabled: false },
    render: jest.fn(),
    domElement: document.createElement('canvas')
  })),
  Color: jest.fn(),
  AmbientLight: jest.fn().mockImplementation(() => ({})),
  DirectionalLight: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    shadow: { 
      mapSize: { width: 0, height: 0 },
      camera: { 
        near: 0, far: 0, left: 0, right: 0, top: 0, bottom: 0 
      }
    }
  })),
  PointLight: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() }
  })),
  SphereGeometry: jest.fn(),
  DodecahedronGeometry: jest.fn(),
  MeshPhongMaterial: jest.fn(),
  MeshPhysicalMaterial: jest.fn(),
  Mesh: jest.fn().mockImplementation(() => ({
    position: { copy: jest.fn() },
    quaternion: { copy: jest.fn() },
    castShadow: false,
    receiveShadow: false,
    add: jest.fn()
  })),
  LineSegments: jest.fn(),
  WireframeGeometry: jest.fn(),
  LineBasicMaterial: jest.fn(),
  Vector3: jest.fn(),
  Quaternion: jest.fn()
}));

jest.mock('three/examples/jsm/controls/OrbitControls', () => ({
  OrbitControls: jest.fn().mockImplementation(() => ({
    enableDamping: false,
    dampingFactor: 0,
    update: jest.fn()
  }))
}));