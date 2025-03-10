// Physics constants
export const BASE_BALL_RADIUS = 0.5;
export const MIN_BALL_RADIUS = 0.3;  // Minimum ball radius
export const MAX_BALL_RADIUS = 0.7;  // Maximum ball radius
export const BALL_MASS = 1;
export const NUM_BALLS = 8;
export const TUMBLER_RADIUS = 4;
export const GRAVITY = -9.82;

// Rotation constants
export const BASE_RPM = 4;  // Base rotations per minute
export const ROTATION_CHANGE_INTERVAL = 5000;  // Milliseconds between rotation changes
export const ROTATION_TRANSITION_TIME = 1000;  // Milliseconds to transition between rotations

// Material properties
export const RESTITUTION = 0.7; // Bounciness
export const FRICTION = 0.3;

// Rendering constants
export const TIMESTEP = 1/60;
export const MAX_SUBSTEPS = 10;

// Colors for balls
export const BALL_COLORS = [
  0xff0000, // Red
  0x00ff00, // Green
  0x0000ff, // Blue
  0xffff00, // Yellow
  0xff00ff, // Magenta
  0x00ffff, // Cyan
  0xffa500, // Orange
  0x800080  // Purple
];