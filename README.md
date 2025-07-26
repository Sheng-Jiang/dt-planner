# Digital Transformation Planner

A strategic planning tool for digital transformation initiatives. This web application helps companies visualize their strategy through an interactive canvas and receive tailored recommendations for digital transformation platforms.

## Features

### Strategy Canvas

- **Interactive Canvas**: Drag and drop interface for positioning company objectives
- **Pre-defined Objectives**: Ready-to-use strategic objectives with icons and categories
- **Visual Organization**: Color-coded categories (Growth, Efficiency, Innovation, Customer, Operations)
- **Real-time Summary**: Live statistics showing objective distribution

### Digital Transformation Recommendations

- **Infrastructure Platform**: Cloud-first architecture and security framework recommendations
- **Data & Analytics Platform**: Data lake, warehouse, and AI/ML pipeline suggestions
- **Application Platform**: Mobile-first applications and API gateway recommendations
- **Implementation Roadmap**: Phased approach with timeline estimates

## Technology Stack

- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Architecture**: Modern component-based architecture ready for mobile development

## Getting Started

Due to npm cache permission issues, you may need to run:

```bash
sudo chown -R $(id -u):$(id -g) ~/.npm
```

Then install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. **Add Objectives**: Click on objective templates in the left palette to add them to your strategy canvas
2. **Arrange Strategy**: Drag and drop objectives on the canvas to organize your strategic vision
3. **Generate Recommendations**: Click "Generate Recommendations" to see tailored digital transformation suggestions
4. **Review Platforms**: Explore recommended infrastructure, data, and application platforms
5. **Implementation Planning**: Review the suggested roadmap and timeline

## Mobile Development Ready

This application is built with React and can be easily extended to mobile platforms using React Native, sharing components and business logic between web and mobile versions.

## Architecture

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
├── types/              # TypeScript type definitions
└── lib/                # Utility functions and data
```
