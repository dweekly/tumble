# Tumble Physics Simulation

A 3D physics simulation of 8 balls of varying sizes interacting within a 12-sided tumbler. The tumbler rotates around random axes at approximately 4 RPM, with smooth transitions between different rotation patterns every 5 seconds.

## Live Demo

Visit [https://tumble-simulation.netlify.app](https://tumble-simulation.netlify.app) to see the simulation in action.

## Features

- Accurate collision detection and resolution
- Realistic physics simulation using Cannon.js
- 3D visualization using Three.js
- Balls of varying sizes with accurate mass proportional to volume
- Dynamic tumbler rotation that changes direction automatically
- Smooth transitions between rotation patterns

## Architecture

- **Physics Engine**: Cannon.js for accurate physics calculations
- **Rendering**: Three.js for 3D visualization
- **Testing**: Jest for unit and integration tests

## Development

```bash
# Install dependencies
npm install

# Run development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## Deployment

This project is configured for easy deployment to Netlify. Just connect your GitHub repository to Netlify and it will build and deploy automatically.

```bash
# Manual build for Netlify
npm run netlify
```

## Controls

- **Reset Simulation**: Resets the positions of all balls
- **Toggle Tumbler Rotation**: Starts/stops the tumbler rotation