# Tumble Physics Simulation

A 3D physics simulation of 8 balls of varying sizes interacting within a 12-sided tumbler. The tumbler rotates around random axes at approximately 4 RPM, with smooth transitions between different rotation patterns every 5 seconds.

## Live Demo

Visit [https://dew-tumble.netlify.app](https://dew-tumble.netlify.app) to see the simulation in action.

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

## Prompts

This project was built with Claude Code. Here is the seed prompt used:

```
We are going to build a web visualization that shows a 12 sided tumbler in which 8 different balls will interact. It's important that the balls never exit the tumbler or intersect each other - I'm looking for accurate collision meshes and realistic physics. Please carefully choose a javascript framework and architecture that will ensure the correctness of the physics simulation as described. Make a detailed project plan before writing any code. Also plan to write tests to ensure the consistency and correctness of the simulation before proceeding    │
to visualizations.
```

I produced the project you see here in 30 minutes with $2.01 of compute cost.git p