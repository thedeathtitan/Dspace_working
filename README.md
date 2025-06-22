# 🏥 Diagnosis-Space AI

## Clinical Reasoning Intelligence Platform

A sophisticated web application that integrates OpenAI's advanced reasoning capabilities with interactive network visualization to create comprehensive medical diagnostic workflows. It now features a professional dark-mode theme, voice-to-text dictation, advanced graph layout controls, and a billable problem list with ICD-10 codes.

![New Dark UI](https://firebasestorage.googleapis.com/v0/b/project-assets-253613.appspot.com/o/github_assets%2FDspace_darkmode.png?alt=media&token=e8869c58-39a1-4643-9844-3c87a9c0490f)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)
![Version](https://img.shields.io/badge/version-1.2.0-green.svg)

## 🚀 Features

### 🎤 Voice-to-Text Input
- **Hands-Free Dictation**: Use your microphone to dictate clinical notes directly into the application.
- **Web Speech API**: Powered by the browser's built-in speech recognition for fast and accurate transcription.

### 🧠 AI-Powered Clinical Analysis
- **OpenAI Integration**: Advanced language models for comprehensive medical analysis
- **Emergency Medicine Focus**: Prompts optimized for emergency department workflows
- **Evidence-Based Reasoning**: Supporting clinical findings for each diagnostic suggestion
- **Confidence Scoring**: Quantified certainty levels for medical decision support
- **Billable Problem List**: Automatic generation of ICD-10 codes for billing and documentation

### 🎨 Professional Healthcare Interface
- **Material-UI Design System**: Complete migration to MUI v6 for consistent, professional components
- **Professional Dark Theme**: A complete UI overhaul featuring a modern, high-contrast dark mode
- **Medical-Grade UI**: Interface components designed for healthcare workflows
- **Responsive Layout**: Seamless experience across desktop, tablet, and mobile devices
- **Accessibility**: WCAG-compliant design with keyboard navigation support

### 📊 Interactive Network Visualization
- **Node-Based Workflow**: Medical concepts represented as interactive network nodes
- **Proportional Node Sizing**: Nodes sized based on diagnosis probability for better visual hierarchy
- **Expandable Details**: Click nodes to reveal comprehensive diagnostic information
- **Color-Coded Priority**: Visual hierarchy indicating clinical urgency levels
- **Advanced Dynamic Layouts**: Choose from multiple layout algorithms with real-time controls
- **Problem List Integration**: Access billable problem list directly from graph interface

### 🔒 Privacy & Security
- **Local Processing**: API keys stored securely in browser only
- **No Data Transmission**: Clinical notes never sent to our servers
- **HIPAA Considerations**: Built with healthcare privacy in mind

## 🛠 Tech Stack

- **Frontend**: React 19.1 + TypeScript 5.8 + Vite 6.3
- **UI Framework**: Material-UI (MUI v6) with custom dark theme
- **Visualization**: Cytoscape.js 3.32 for interactive network diagrams
- **State Management**: Zustand 5.0 with localStorage persistence
- **AI Integration**: OpenAI API with structured JSON responses
- **Build Tools**: Vite + ESLint 9 + PostCSS + Autoprefixer

## 📋 Prerequisites

- **Node.js**: Version 18 or higher
- **OpenAI API Key**: Required for AI-powered analysis
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd diagnosis-space
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open Application
Navigate to `http://localhost:5173` in your browser

### 5. Configure OpenAI API
- Enter your OpenAI API key in the application interface
- Keys are stored securely in your browser's local storage
- Get an API key at [OpenAI Platform](https://platform.openai.com/api-keys)

## 📖 Usage Guide

### Basic Workflow
1. **Enter API Key**: Configure your OpenAI credentials
2. **Input Clinical Note**: Describe patient presentation, history, and findings (or use voice dictation)
3. **Generate Analysis**: Click "Generate AI Analysis" to create workflow
4. **Explore Results**: Click nodes to expand detailed information
5. **Navigate Diagram**: Use zoom, pan, and fit-to-view controls
6. **Access Problem List**: Click the medical icon button to view billable problem list with ICD-10 codes
7. **Customize Layout**: Use the settings icon to adjust graph layout and positioning

### Sample Clinical Note
```
67-year-old male presents to ED with 3-day history of progressive dyspnea 
and bilateral lower extremity swelling. Patient reports orthopnea and 
paroxysmal nocturnal dyspnea. Past medical history significant for 
hypertension and diabetes mellitus type 2.

Physical Examination:
- Vital Signs: BP 160/90, HR 110 bpm, RR 22, O2 sat 88% on room air
- General: Appears uncomfortable, sitting upright
- Cardiovascular: S3 gallop present, elevated JVP to 12 cm
- Pulmonary: Bilateral basilar crackles extending to mid-lung fields
- Extremities: 2+ pitting edema bilateral lower extremities to knees
```

## 🏗 Architecture

### Component Structure
```
src/
├── components/           # React components
│   ├── ApiKeyInput.tsx   # Secure API key management
│   ├── GraphBoard.tsx    # Cytoscape visualization component
│   ├── Legend.tsx        # Interface legend and controls
│   ├── NoteInput.tsx     # Clinical note input form
│   ├── ProblemList.tsx   # Billable problem list dialog
│   └── VoiceRecorder.tsx # Voice dictation component
├── store/               # State management
│   └── diagStore.ts     # Zustand store with localStorage persistence
├── types/               # TypeScript definitions
│   └── index.ts         # Medical data types and interfaces
├── utils/               # Utility functions
│   ├── openai.ts        # OpenAI API integration
│   └── layout.ts        # Graph layout algorithms
├── theme.ts             # Material-UI theme configuration
└── App.tsx              # Main application component
```

### Data Flow
1. **User Input** → Clinical note entered via NoteInput component
2. **AI Processing** → OpenAI API analyzes clinical content
3. **Data Transformation** → Structured JSON converted to graph nodes
4. **Visualization** → Interactive Cytoscape network diagram
5. **User Interaction** → Click, expand, and explore diagnostic workflow

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment Setup
```bash
# Install dependencies
npm install

# Start development with hot reload
npm run dev

# Build optimized production bundle
npm run build
```

## 🧪 Testing

The application includes test nodes that appear when no clinical data is present, allowing you to verify that the visualization system is working correctly.

### Manual Testing Checklist
- [ ] API key input and storage
- [ ] Clinical note analysis
- [ ] Node generation and positioning
- [ ] Interactive node expansion
- [ ] Zoom and pan controls
- [ ] Responsive design

## 🚨 Important Disclaimers

### Medical Use
- **Research & Education Only**: Not intended for actual clinical diagnosis
- **Professional Validation Required**: All AI-generated content should be reviewed by healthcare professionals
- **No Medical Advice**: This tool does not provide medical advice or replace clinical judgment

### Data Privacy
- **Local Processing**: All data processed in your browser
- **No Cloud Storage**: Clinical notes are not saved or transmitted
- **API Key Security**: Keys stored locally using browser encryption

## 🛣 Roadmap

### Planned Features
- [ ] Multiple AI model support (Claude, GPT-4, etc.)
- [ ] FHIR data integration
- [ ] Clinical decision support rules
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Healthcare system integration APIs

### Technical Improvements
- [ ] Unit and integration testing
- [ ] Performance optimization
- [ ] Offline mode support
- [ ] PWA capabilities
- [ ] Advanced accessibility features

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

### Development Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI**: For the powerful O3 reasoning model
- **Anthropic**: For Claude's design inspiration and AI assistance
- **Cytoscape.js**: For the excellent visualization framework
- **Tailwind CSS**: For the utility-first styling system
- **Medical Community**: For insights into clinical workflow needs

## 📞 Support

For questions, issues, or feedback:
- Open an issue on GitHub
- Contact the development team
- Review documentation and examples

## 🏥 About Diagnosis-Space

Diagnosis-Space AI represents the future of clinical decision support, combining state-of-the-art artificial intelligence with intuitive user interfaces to enhance medical reasoning and improve patient care outcomes.

---

**⚠️ Research & Education Only - Not for Clinical Use**

Built with ❤️ for the healthcare community

## MCP Integration

The app uses a custom MCP (Model Context Protocol) client that provides:

### **Bulletproof JSON Handling**
1. **Direct JSON Response**: Primary strategy for clean JSON
2. **Markdown Extraction**: Fallback for JSON wrapped in code blocks
3. **Pattern Matching**: Extract JSON-like structures from text
4. **Minimal Valid Structure**: Final fallback with emergency assessment

### **Medical Knowledge Base**
- Emergency medicine principles (ABCDE approach)
- Common presentations by system (Cardiac, Respiratory, Neurologic, etc.)
- ICD-10 code database
- Diagnostic and treatment algorithms

### **Fallback Strategy**
- MCP client attempts structured analysis first
- Falls back to direct OpenAI calls if MCP fails
- Multiple retry attempts with exponential backoff
- Comprehensive error handling and logging