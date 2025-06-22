# Development Notes

## Quick Start Commands

### Project Setup
```bash
cd diagnosis-space
npm install
npm run dev
```

### Key Dependencies Installed
- `cytoscape`: Cytoscape.js v3.32 for network graphs
- `react-cytoscapejs`: React wrapper for Cytoscape
- `dagre`: Auto-layout algorithm for hierarchical layouts
- `zustand`: Lightweight state management (v5.0.5)
- `@mui/material`: Material-UI v6 component library
- `@mui/icons-material`: Material-UI icons
- `@emotion/react`: CSS-in-JS styling for MUI
- `@emotion/styled`: Styled components for MUI

## Development Workflow

### 1. Component Development Order
1. Set up Zustand store (`src/store/diagStore.ts`)
2. Create NoteInput component for clinical notes
3. Set up GraphBoard with Cytoscape.js
4. Build interactive node expansion system
5. Integrate OpenAI API directly in frontend
6. Add Problem List component for billable diagnoses

### 2. Frontend-Only Architecture
This application uses a frontend-only architecture:
- OpenAI API integration directly in browser
- No backend server required
- Secure API key storage in localStorage
- All processing happens client-side

### 3. Testing Strategy
- Manual testing with real clinical scenarios
- Cross-browser compatibility testing
- Responsive design testing across devices
- API integration testing with OpenAI

## Key Implementation Details

### Cytoscape.js Setup
- **Multiple Layouts**: Supports dynamic switching between several algorithms (Force, Hierarchical, Circular, etc.).
- **Layout Controls**: Sliders and dropdowns for real-time adjustment of graph physics and appearance.
- **Proportional Node Sizing**: Nodes sized based on diagnosis probability for better visual hierarchy
- Node types: `diagnosis`, `differential`, `action`
- Interactive layout with manual positioning
- Click-to-expand node details
- Pan, zoom, and fit-to-view controls

### Voice Input
- **Web Speech API**: Utilizes the browser's native speech recognition capabilities.
- **Hands-Free Dictation**: Allows users to dictate clinical notes directly into the application, which are then transcribed to text.

### Problem List Feature
- **Billable Problem List**: Automatic generation of ICD-10 codes for billing and documentation
- **Problem List UI**: Accessible button in graph interface that opens comprehensive problem list dialog
- **Enhanced OpenAI Schema**: Updated JSON schema to include problem list generation with likelihood scores and clinical evidence

### State Management
- Single Zustand store for simplicity
- Separate slices for note text, graph data, and problem list
- Loading states for API calls

### Styling Approach
- **Material-UI (MUI v6)**: Complete migration from Tailwind CSS to MUI for consistent design system
- **Custom Dark Theme**: Global MUI theme configuration reflecting original dark color palette
- CSS-in-JS styling for Cytoscape nodes
- Color-coded priority system for clinical urgency
- Responsive design patterns throughout

## Common Patterns

### Cytoscape Node Structure
```typescript
interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    type: 'diagnosis' | 'differential' | 'action';
    priority: 'urgent' | 'high' | 'medium' | 'low';
    details?: string;
    confidence?: number;
  };
}

// Node styling based on type and priority
const nodeStyles = {
  'node[type="diagnosis"]': {
    'background-color': '#3b82f6',
    'color': '#ffffff'
  }
};
```

### API Integration Pattern
```typescript
const analyzeNote = async (note: string, apiKey: string) => {
  setLoading(true);
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [{ role: 'user', content: note }],
      functions: [medicalAnalysisSchema]
    }, {
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    setGraph(processOpenAIResponse(response.data));
  } catch (error) {
    // Handle API errors
  } finally {
    setLoading(false);
  }
};
```

## Troubleshooting

### Common Issues
1. **Cytoscape not rendering**: Ensure container has defined height/width
2. **Layout positioning problems**: Check node data format and IDs
3. **State not updating**: Verify Zustand store subscriptions
4. **API key errors**: Check localStorage and OpenAI API key validity

### Performance Tips
- Use React.memo for frequently re-rendering components
- Debounce API calls to avoid excessive requests
- Optimize Cytoscape graph updates with batch operations
- Implement proper cleanup for event listeners

## Architecture Decisions

### Why Cytoscape.js?
- Mature, battle-tested graph visualization library
- Excellent performance with large datasets
- Flexible styling and layout options
- Strong community and documentation

### Why Zustand over Redux?
- Minimal boilerplate
- Direct store subscriptions
- TypeScript-friendly
- Smaller bundle size

### Why Frontend-Only Architecture?
- Simplified deployment and hosting
- Better privacy (no data sent to backend)
- Direct OpenAI API integration
- Easier maintenance and updates

## API Design Notes

### OpenAI Integration
```typescript
// Direct API calls to OpenAI
const openaiRequest = {
  model: 'gpt-4',
  messages: [...],
  functions: [medicalAnalysisSchema],
  temperature: 0.1
};
```

### Error Handling
- 401: Invalid API key
- 429: Rate limit exceeded
- 500: OpenAI service errors
- Network errors with retry logic

## Future Enhancements

### Phase 2 Features
- Real-time collaboration
- Graph versioning/history
- Custom node templates
- Export functionality

### Integration Possibilities
- EMR system connections
- FHIR data import/export
- Clinical decision support rules
- Audit logging for compliance

## Useful Resources
- [Cytoscape.js Documentation](https://js.cytoscape.org/)
- [React Cytoscape.js](https://github.com/plotly/react-cytoscapejs)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Material-UI Documentation](https://mui.com/material-ui/getting-started/overview/)

## Architecture Overview

### MCP Integration Architecture
The application now uses a custom MCP (Model Context Protocol) client that provides bulletproof JSON handling for OpenAI responses. This ensures consistent, structured output even when the AI model returns malformed JSON.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │───▶│   MCP Client    │───▶│   OpenAI API    │
│                 │    │                 │    │                 │
│ - Note Input    │    │ - JSON Parsing  │    │ - GPT-4o        │
│ - Graph Display │    │ - Fallbacks     │    │ - Function Call │
│ - Problem List  │    │ - Validation    │    │ - Whisper       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         └──────────────│   Fallback      │◀─────────────┘
                        │   Strategy      │
                        │                 │
                        │ - Direct OpenAI │
                        │ - Retry Logic   │
                        │ - Error Handle  │
                        └─────────────────┘
```

### JSON Handling Strategies

The MCP client implements four progressive strategies for handling OpenAI responses:

1. **Direct JSON Response**: Attempts to parse the response as direct JSON
2. **Markdown Extraction**: Extracts JSON from markdown code blocks
3. **Pattern Matching**: Finds JSON-like structures in text responses
4. **Minimal Valid Structure**: Returns a basic emergency assessment structure

### Medical Knowledge Integration

The system includes a comprehensive medical knowledge base covering:
- Emergency medicine principles (ABCDE approach)
- Common presentations by system
- ICD-10 code database
- Diagnostic and treatment algorithms

## Key Components

### MCP Client (`src/utils/mcpClient.ts`)
- **Purpose**: Provides bulletproof JSON handling for OpenAI responses
- **Features**: Multiple fallback strategies, schema validation, medical knowledge integration
- **Dependencies**: OpenAI SDK, Zod for validation

### OpenAI Integration (`src/utils/openai.ts`)
- **Purpose**: Main interface for AI analysis with MCP fallback
- **Features**: MCP client integration, fallback to direct calls, error handling
- **Dependencies**: MCP client, OpenAI API

### State Management (`src/store/diagStore.ts`)
- **Purpose**: Centralized state management using Zustand
- **Features**: Graph data, problem list, loading states, API key management

## Data Flow

1. **User Input**: Clinical note entered via text or voice
2. **MCP Analysis**: MCP client processes note with medical knowledge
3. **JSON Validation**: Zod schemas validate response structure
4. **Fallback Handling**: Multiple strategies ensure valid output
5. **State Update**: Validated data updates React state
6. **UI Rendering**: Graph and problem list display updated data

## Error Handling

### MCP Client Errors
- **JSON Parsing Failures**: Automatic fallback to next strategy
- **Schema Validation Errors**: Logged with detailed error information
- **API Errors**: Retry logic with exponential backoff

### OpenAI API Errors
- **Rate Limiting**: Built-in request throttling
- **Network Issues**: Retry with backoff strategy
- **Invalid Responses**: Fallback to direct OpenAI calls

## Performance Considerations

### MCP Client Optimization
- **Caching**: Medical knowledge base cached in memory
- **Lazy Loading**: Strategies loaded only when needed
- **Efficient Parsing**: Optimized JSON parsing algorithms

### React App Optimization
- **Memoization**: Components memoized to prevent unnecessary re-renders
- **State Updates**: Batched state updates for better performance
- **Graph Rendering**: Cytoscape optimized for large datasets

## Testing Strategy

### Unit Tests
- **MCP Client**: Test each JSON parsing strategy
- **Schema Validation**: Test Zod schemas with various inputs
- **Error Handling**: Test fallback mechanisms

### Integration Tests
- **OpenAI Integration**: Test MCP client with OpenAI API
- **State Management**: Test Zustand store updates
- **UI Components**: Test React component interactions

### End-to-End Tests
- **User Workflows**: Test complete analysis workflows
- **Error Scenarios**: Test error handling and recovery
- **Performance**: Test with large datasets

## Deployment Considerations

### Environment Variables
- **OpenAI API Key**: Required for AI functionality
- **Environment**: Development vs production settings
- **Logging**: Error logging and monitoring

### Build Optimization
- **Bundle Size**: Code splitting for better performance
- **Tree Shaking**: Remove unused code
- **Minification**: Optimize for production

## Future Enhancements

### Planned Features
- **Local MCP Server**: Standalone MCP server process
- **Advanced Medical Knowledge**: Expanded medical database
- **Real-time Collaboration**: Multi-user support
- **Export Features**: PDF reports and data export

### Technical Improvements
- **WebSocket Integration**: Real-time updates
- **Offline Support**: Service worker for offline functionality
- **Advanced Analytics**: Usage analytics and insights
- **Performance Monitoring**: Real-time performance tracking

## Development Guidelines

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code formatting
- **Prettier**: Automatic code formatting
- **Comments**: Comprehensive documentation

### Git Workflow
- **Feature Branches**: Create branches for new features
- **Commit Messages**: Descriptive commit messages
- **Pull Requests**: Code review for all changes
- **Versioning**: Semantic versioning for releases

### Documentation
- **API Documentation**: Comprehensive API docs
- **Component Documentation**: Storybook for components
- **User Guides**: Step-by-step user instructions
- **Developer Guides**: Setup and contribution guides