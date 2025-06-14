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
- `axios`: HTTP client for API communication
- `clsx`: Conditional CSS class utility
- `tailwindcss`: Utility-first CSS framework (v4.1.10)

## Development Workflow

### 1. Component Development Order
1. Set up Zustand store (`src/store/diagStore.ts`)
2. Create NoteInput component for clinical notes
3. Set up GraphBoard with Cytoscape.js
4. Build interactive node expansion system
5. Integrate OpenAI API directly in frontend

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
- Node types: `diagnosis`, `differential`, `action`
- Interactive layout with manual positioning
- Click-to-expand node details
- Pan, zoom, and fit-to-view controls

### State Management
- Single Zustand store for simplicity
- Separate slices for note text and graph data
- Loading states for API calls

### Styling Approach
- Tailwind utility classes for consistent design
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
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)