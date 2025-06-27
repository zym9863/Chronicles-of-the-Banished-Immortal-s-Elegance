# Chronicles of the Banished Immortal's Elegance - 谪仙风流录

An interactive 3D ancient-style exploration app based on Three.js, inspired by the legendary poet Li Bai.

## 🎨 Project Features

### 🏛️ Immersive Ancient Scenes
- **Chang'an City Architecture** - Majestic towers, red mansions, and other classical buildings
- **Distant Mountains** - Layered mountain landscapes
- **Ancient Decorations** - Lanterns, old trees, and more
- **Dynamic Lighting** - Real-time shadows and atmospheric fog

### 🎵 Interactive Cultural Experience
- **Jade Flute** - Melodious and lingering sounds
- **Wine Cup** - Toasts of fine wine
- **Long Sword** - Swift and decisive action
- **Konghou** - Heavenly music rarely heard on earth

### ✨ Rich Visual Effects
- **Animation System** - Floating, rotating, pulsing, glowing, bouncing, and more
- **Interactive Feedback** - Hover highlights, click animations
- **Poetry Display** - Elegant presentation of classical poetry and descriptions

### 🎮 Complete User Experience
- **First-Person Controls** - WASD movement, mouse view control
- **Settings System** - Comprehensive graphics, audio, control, and display settings
- **Help System** - Detailed operation guide and feature introduction
- **Performance Optimization** - Adaptive quality adjustment, LOD system

## 🚀 Tech Stack

- **Three.js** - 3D rendering
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **pnpm** - Efficient package manager

## 📦 Project Structure

```
src/
├── components/          # Component modules
│   ├── FirstPersonControls.ts    # First-person controller
│   ├── InteractionSystem.ts      # Interaction system
│   ├── SettingsPanel.ts          # Settings panel
│   └── HelpPanel.ts              # Help panel
├── scenes/             # Scene modules
│   ├── SceneManager.ts           # Scene manager
│   └── ChanganCityBuilder.ts     # Chang'an city builder
├── utils/              # Utility modules
│   ├── AudioManager.ts           # Audio manager
│   ├── AnimationManager.ts       # Animation manager
│   ├── TextDisplayManager.ts     # Text display manager
│   ├── FPSMonitor.ts            # FPS monitor
│   ├── PerformanceOptimizer.ts   # Performance optimizer
│   └── TestRunner.ts            # Test runner
├── assets/             # Assets
│   ├── models/         # 3D models
│   ├── textures/       # Textures
│   └── sounds/         # Audio files
├── main.ts            # Main entry
└── style.css          # Stylesheet
```

## 🎯 Core Features

### 3D Scene Interactive Exploration
- Freely explore Chang'an city in first-person view
- Rich architectural and environmental details
- Real-time lighting and weather effects

### Cultural Item Interaction
- Click to trigger poetry display
- Animation effects enhance immersion
- Sound effects for atmosphere (in development)

### Complete User Interface
- Ancient-style theme design
- Responsive layout
- Accessibility support

### Performance Optimization
- Adaptive quality adjustment
- LOD (Level of Detail) system
- Frustum culling optimization

## 🎮 Controls Guide

### Basic Controls
- **WASD** - Move character
- **Mouse Move** - Control view
- **Left Mouse Button** - Interact with items
- **ESC** - Open/close settings
- **F1** - Open/close help

### Interaction Tips
- Interactive items emit a soft glow
- Prompts appear when nearby
- Click to play animation and display poetry

## 🛠️ Development Guide

### Requirements
- Node.js 16+
- pnpm 8+
- Modern browser (WebGL support)

### Install Dependencies
```bash
pnpm install
```

### Development Mode
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

### Preview Build
```bash
pnpm preview
```

## 🔧 Configuration Options

### Graphics Settings
- **Quality Level** - Low/Medium/High
- **Shadow Quality** - Off/Low/Medium/High
- **Fog Toggle** - On/Off

### Audio Settings
- **Master Volume** - 0-100%
- **Music Volume** - 0-100%
- **SFX Volume** - 0-100%

### Control Settings
- **Mouse Sensitivity** - 0.1-3.0
- **Move Speed** - 5-20
- **Invert Mouse Y** - On/Off

### Display Settings
- **FPS Display** - On/Off
- **UI Scale** - Small/Normal/Large

## 🌟 Highlights

### Cultural Depth
- Inspired by Li Bai's poetry
- Modern presentation of classical culture
- Perfect blend of poetry and technology

### Technical Innovation
- Modular architecture
- Robust performance optimization
- Responsive user experience

### Visual Effects
- Ancient-style UI design
- Rich animations
- Immersive 3D environment

## 📱 Compatibility

### Supported Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### System Requirements
- WebGL-capable GPU
- 4GB+ RAM recommended
- Modern OS

## 🤝 Contribution Guide

Contributions via Issues and Pull Requests are welcome!

### Development Standards
- Use TypeScript for type safety
- Follow ESLint code standards
- Write clear comments and documentation

### Commit Conventions
- feat: New feature
- fix: Bug fix
- docs: Documentation update
- style: Code style changes
- refactor: Code refactor
- test: Test related
- chore: Build tools, etc.

## 📄 License

MIT License

## 🙏 Acknowledgements

Thanks to all developers and creatives who contributed to this project!

---

*May you feel the poetic elegance of the banished immortal in this ancient world* ✨
