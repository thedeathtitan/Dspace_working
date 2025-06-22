import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import type { Core } from 'cytoscape';
import { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  Slider, 
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { Settings, MedicalServices } from '@mui/icons-material';
import { useDiagStore } from '../store/diagStore';
import type { DiagnosisNode, DiagnosisEdge } from '../types';
import { getLayoutedElements, getSmartLayout } from '../utils/layout';
import { ProblemList } from './ProblemList';

interface SelectedInfo {
  id: string;
  label: string;
  details?: string;
  confidence?: number;
  likelihood?: number;
  priority?: string;
  evidence?: string[];
  category?: string;
  timing?: string;
  group_name?: string;
  type: string;
}

type LayoutType = 'smart' | 'force' | 'hierarchical' | 'circular' | 'grid' | 'preset';

interface LayoutConfig {
  nodeRepulsion: number;
  idealEdgeLength: number;
  gravity: number;
  numIter: number;
  initialTemp: number;
  coolingFactor: number;
}

export function GraphBoard() {
  const { graph, problemList } = useDiagStore();
  const [elements, setElements] = useState<cytoscape.ElementDefinition[]>([]);
  const [selected, setSelected] = useState<SelectedInfo | null>(null);
  const [layoutType, setLayoutType] = useState<LayoutType>('force');
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    nodeRepulsion: 25000,
    idealEdgeLength: 250,
    gravity: 0.1,
    numIter: 1500,
    initialTemp: 300,
    coolingFactor: 0.92
  });
  const [cyInstance, setCyInstance] = useState<Core | null>(null);
  const [layoutDialogOpen, setLayoutDialogOpen] = useState(false);
  const [problemListOpen, setProblemListOpen] = useState(false);

  const testNodes: DiagnosisNode[] = [
    {
      id: 'test-1',
      position: { x: 100, y: 100 },
      data: {
        label: 'Primary Diagnosis',
        type: 'diagnosis',
        confidence: 0.9,
        likelihood: 0.8,
        details: 'Test diagnosis node'
      }
    },
    {
      id: 'test-2',
      position: { x: 300, y: 100 },
      data: {
        label: 'Next Action',
        type: 'next_action',
        priority: 'high',
        category: 'diagnostic',
        details: 'Test action node'
      }
    }
  ];

  const testEdges: DiagnosisEdge[] = [
    { id: 'e1', source: 'test-1', target: 'test-2', label: '' }
  ];

  // Enhanced force-directed layout configuration
  const getForceLayout = useCallback(() => ({
    name: 'cose',
    fit: true,
    padding: 80,
    // Enhanced force parameters
    nodeRepulsion: function() { return layoutConfig.nodeRepulsion; },
    nodeOverlap: 30,
    idealEdgeLength: function() { return layoutConfig.idealEdgeLength; },
    edgeElasticity: function() { return 120; },
    nestingFactor: 1.5,
    gravity: layoutConfig.gravity,
    numIter: layoutConfig.numIter,
    initialTemp: layoutConfig.initialTemp,
    coolingFactor: layoutConfig.coolingFactor,
    minTemp: 0.5,
    // Animation
    animate: true,
    animationDuration: 1500,
    animationEasing: 'ease-out-cubic',
    // Randomization for better initial positioning
    randomize: true,
    componentSpacing: 150,
    // Node dimensions for better spacing
    nodeDimensionsIncludeLabels: true
  }), [layoutConfig]);

  // Hierarchical layout using dagre
  const getHierarchicalLayout = useCallback(() => ({
    name: 'dagre',
    fit: true,
    padding: 60,
    rankdir: 'TB', // Top to bottom
    ranksep: 120,
    nodesep: 80,
    edgesep: 60,
    animate: true,
    animationDuration: 1000,
    animationEasing: 'ease-out'
  }), []);

  // Circular layout for better overview
  const getCircularLayout = useCallback(() => ({
    name: 'circle',
    fit: true,
    padding: 60,
    radius: undefined, // Auto-calculate
    startAngle: 0,
    sweep: 360,
    clockwise: true,
    sort: undefined,
    animate: true,
    animationDuration: 1000,
    animationEasing: 'ease-out'
  }), []);

  // Grid layout for organized presentation
  const getGridLayout = useCallback(() => ({
    name: 'grid',
    fit: true,
    padding: 60,
    cols: undefined, // Auto-calculate
    rows: undefined, // Auto-calculate
    position: function(node: any) {
      // Custom positioning based on node type
      const type = node.data('type');
      if (type === 'diagnosis') {
        return { row: 0, col: node.id().charCodeAt(0) % 3 };
      } else if (type === 'next_action') {
        return { row: 1, col: node.id().charCodeAt(0) % 3 };
      }
      return { row: 2, col: node.id().charCodeAt(0) % 3 };
    },
    sort: function(a: any, b: any) {
      // Sort by type, then by priority
      const typeOrder: Record<string, number> = { diagnosis: 0, next_action: 1, completed: 2 };
      const aType = typeOrder[a.data('type')] || 3;
      const bType = typeOrder[b.data('type')] || 3;
      if (aType !== bType) return aType - bType;
      
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.data('priority')] || 4;
      const bPriority = priorityOrder[b.data('priority')] || 4;
      return aPriority - bPriority;
    },
    animate: true,
    animationDuration: 800,
    animationEasing: 'ease-out'
  }), []);

  // Preset layout for LLM-provided positions with force refinement
  const getPresetLayout = useCallback(() => ({
    name: 'preset',
    fit: true,
    padding: 60,
    positions: undefined, // Will be set by elements
    zoom: undefined,
    pan: undefined,
    animate: true,
    animationDuration: 500,
    animationEasing: 'ease-out'
  }), []);

  // Smart layout that automatically chooses the best algorithm
  const getSmartLayoutConfig = useCallback(() => {
    if (graph.nodes.length === 0) return getForceLayout();
    
    const nodeCount = graph.nodes.length;
    const hasHierarchy = graph.edges.some(edge => edge.type === 'next-step');
    
    if (nodeCount <= 5) {
      return getForceLayout();
    } else if (hasHierarchy && nodeCount <= 15) {
      return getHierarchicalLayout();
    } else if (nodeCount > 15) {
      return getForceLayout();
    } else {
      return getForceLayout();
    }
  }, [graph.nodes.length, graph.edges, getForceLayout, getHierarchicalLayout]);

  const getLayout = useCallback(() => {
    switch (layoutType) {
      case 'smart':
        return getSmartLayoutConfig();
      case 'force':
        return getForceLayout();
      case 'hierarchical':
        return getHierarchicalLayout();
      case 'circular':
        return getCircularLayout();
      case 'grid':
        return getGridLayout();
      case 'preset':
        return getPresetLayout();
      default:
        return getForceLayout();
    }
  }, [layoutType, getForceLayout, getHierarchicalLayout, getCircularLayout, getGridLayout, getPresetLayout, getSmartLayoutConfig]);

  useEffect(() => {
    console.log('GraphBoard: graph updated', { nodeCount: graph.nodes.length, edgeCount: graph.edges.length });
    
    let nodesToUse = graph.nodes.length > 0 ? graph.nodes : testNodes;
    let edgesToUse = graph.nodes.length > 0 ? graph.edges : testEdges;

    // Apply smart layout preprocessing for better organization
    if (layoutType === 'smart' && graph.nodes.length > 0) {
      const smartLayouted = getSmartLayout(nodesToUse, edgesToUse);
      nodesToUse = smartLayouted.nodes;
      edgesToUse = smartLayouted.edges;
    } else if (layoutType === 'hierarchical' && graph.nodes.length > 0) {
      const layouted = getLayoutedElements(nodesToUse, edgesToUse, 'TB');
      nodesToUse = layouted.nodes;
      edgesToUse = layouted.edges;
    }

    const nodes = nodesToUse.map((n) => ({
      data: {
        id: n.id,
        ...n.data,
      },
      position: n.position,
      selectable: true,
      grabbable: true,
      classes: n.data.type
    }));

    const edges = edgesToUse.map((e) => ({
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label
      }
    }));

    console.log('GraphBoard: setting elements', { nodes: nodes.length, edges: edges.length });
    setElements([...nodes, ...edges]);
  }, [graph, layoutType]);

  // Apply new layout when layout type or config changes
  useEffect(() => {
    if (cyInstance && elements.length > 0) {
      // Only apply layout if there are actual nodes to layout
      const hasNodes = elements.some(el => el.group === 'nodes');
      if (hasNodes) {
        const layout = cyInstance.layout(getLayout());
        layout.run();
      }
    }
  }, [layoutType, cyInstance, elements.length, getLayout]);

  // Debounced layout config changes to prevent excessive re-layouts
  useEffect(() => {
    if (cyInstance && elements.length > 0 && layoutType === 'force') {
      const timeoutId = setTimeout(() => {
        const hasNodes = elements.some(el => el.group === 'nodes');
        if (hasNodes) {
          const layout = cyInstance.layout(getLayout());
          layout.run();
        }
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [layoutConfig, cyInstance, elements.length, layoutType, getLayout]);

  const handleCy = (cy: Core) => {
    // Store cy instance for layout management
    setCyInstance(cy);
    
    // Set zoom limits
    cy.minZoom(0.1);
    cy.maxZoom(3.0);
    
    // Add node selection handler
    cy.on('tap', 'node', (evt: cytoscape.EventObject) => {
      const d = evt.target.data() as SelectedInfo;
      setSelected(d);
    });
  };

  const applyLayout = () => {
    if (cyInstance && elements.length > 0) {
      const layout = cyInstance.layout(getLayout());
      layout.run();
    }
    setLayoutDialogOpen(false);
  };

  const resetView = () => {
    if (cyInstance) {
      cyInstance.fit();
      cyInstance.center();
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', bgcolor: 'background.default' }}>
      {/* Cytoscape Graph */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <CytoscapeComponent
          elements={elements}
          style={{ width: '100%', height: '100%' }}
          cy={handleCy}
          layout={getLayout()}
          stylesheet={[
            {
              selector: 'node',
              style: {
                'background-color': '#007acc',
                'label': 'data(label)',
                'color': '#ffffff',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-size': '12px',
                'font-weight': 'bold',
                'text-wrap': 'wrap',
                'text-max-width': '120px',
                'border-width': 2,
                'border-color': '#ffffff',
                'width': 'data(size)',
                'height': 'data(size)',
                'shape': 'data(shape)',
                'text-outline-width': 1,
                'text-outline-color': '#000000',
              }
            },
            {
              selector: 'node[type="diagnosis"]',
              style: {
                'background-color': '#007acc',
                'shape': 'ellipse',
                'width': function(ele: any) {
                  const likelihood = ele.data('likelihood') || 0.5;
                  const confidence = ele.data('confidence') || 0.5;
                  const probability = (likelihood + confidence) / 2;
                  return Math.max(60, Math.min(200, 60 + probability * 140));
                },
                'height': function(ele: any) {
                  const likelihood = ele.data('likelihood') || 0.5;
                  const confidence = ele.data('confidence') || 0.5;
                  const probability = (likelihood + confidence) / 2;
                  return Math.max(60, Math.min(200, 60 + probability * 140));
                },
                'font-size': function(ele: any) {
                  const likelihood = ele.data('likelihood') || 0.5;
                  const confidence = ele.data('confidence') || 0.5;
                  const probability = (likelihood + confidence) / 2;
                  return Math.max(10, Math.min(16, 10 + probability * 6));
                }
              }
            },
            {
              selector: 'node[type="next_action"]',
              style: {
                'background-color': '#10b981',
                'shape': 'triangle',
                'width': function(ele: any) {
                  const priority = ele.data('priority');
                  if (priority === 'urgent') return 80;
                  if (priority === 'high') return 70;
                  if (priority === 'medium') return 60;
                  return 50;
                },
                'height': function(ele: any) {
                  const priority = ele.data('priority');
                  if (priority === 'urgent') return 80;
                  if (priority === 'high') return 70;
                  if (priority === 'medium') return 60;
                  return 50;
                }
              }
            },
            {
              selector: 'node[type="differential"]',
              style: {
                'background-color': '#60a5fa',
                'shape': 'ellipse',
                'width': function(ele: any) {
                  const likelihood = ele.data('likelihood') || 0.5;
                  return Math.max(50, Math.min(150, 50 + likelihood * 100));
                },
                'height': function(ele: any) {
                  const likelihood = ele.data('likelihood') || 0.5;
                  return Math.max(50, Math.min(150, 50 + likelihood * 100));
                }
              }
            },
            {
              selector: 'node[priority="urgent"]',
              style: {
                'background-color': '#ef4444',
              }
            },
            {
              selector: 'node[priority="high"]',
              style: {
                'background-color': '#f97316',
              }
            },
            {
              selector: 'node[priority="medium"]',
              style: {
                'background-color': '#eab308',
              }
            },
            {
              selector: 'node[priority="low"]',
              style: {
                'background-color': '#22c55e',
              }
            },
            {
              selector: 'edge',
              style: {
                'width': 2,
                'line-color': '#666666',
                'target-arrow-color': '#666666',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(label)',
                'font-size': '10px',
                'color': '#ffffff',
                'text-outline-width': 1,
                'text-outline-color': '#000000',
              }
            },
            {
              selector: 'node:selected',
              style: {
                'border-width': 4,
                'border-color': '#007acc',
                'border-opacity': 0.8,
              }
            },
            {
              selector: 'edge:selected',
              style: {
                'width': 4,
                'line-color': '#007acc',
                'target-arrow-color': '#007acc',
              }
            }
          ]}
        />

        {/* Layout Controls Button */}
        <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10, display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => setLayoutDialogOpen(true)}
            sx={{ 
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.default',
                boxShadow: 3,
              }
            }}
          >
            <Settings />
          </IconButton>
          
          <IconButton
            onClick={() => setProblemListOpen(true)}
            sx={{ 
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.default',
                boxShadow: 3,
              }
            }}
          >
            <MedicalServices />
          </IconButton>
        </Box>

        {/* Node Details Panel */}
        {selected && (
          <Box sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            bgcolor: 'background.paper', 
            border: 1, 
            borderColor: 'divider', 
            borderRadius: 1, 
            p: 3, 
            maxWidth: 320, 
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-4px)',
            },
            transition: 'all 0.3s ease'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: 'primary.main', 
                borderRadius: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <Typography sx={{ color: 'white', fontSize: '1.125rem' }}>
                  {selected.type === 'diagnosis' ? '🏥' : selected.type === 'next_action' ? '⚡' : '🔍'}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {selected.label}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip 
                    label={selected.type} 
                    size="small" 
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}
                  />
                  {selected.likelihood && (
                    <Chip 
                      label={`${Math.round(selected.likelihood * 100)}%`} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'success.main',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>

            {selected.group_name && (
              <Paper sx={{ mb: 1.5, p: 1.5, bgcolor: 'background.default' }}>
                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  Group: {selected.group_name}
                </Typography>
              </Paper>
            )}

            {selected.details && (
              <Paper sx={{ mb: 2, p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                  {selected.details}
                </Typography>
              </Paper>
            )}

            {(selected.likelihood || selected.confidence) && (
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                {selected.likelihood && (
                  <Box sx={{ flex: 1 }}>
                    <Paper sx={{ 
                      p: 1.5, 
                      bgcolor: 'background.default',
                      textAlign: 'center'
                    }}>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500, display: 'block', mb: 0.5 }}>
                        Likelihood
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        {Math.round(selected.likelihood * 100)}%
                      </Typography>
                    </Paper>
                  </Box>
                )}
                {selected.confidence && (
                  <Box sx={{ flex: 1 }}>
                    <Paper sx={{ 
                      p: 1.5, 
                      bgcolor: 'background.default',
                      textAlign: 'center'
                    }}>
                      <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500, display: 'block', mb: 0.5 }}>
                        Confidence
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                        {Math.round(selected.confidence * 100)}%
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}

            {selected.priority && (
              <Paper sx={{ mb: 1.5, p: 1.5, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    Priority:
                  </Typography>
                  <Chip 
                    label={selected.priority} 
                    size="small" 
                    sx={{ 
                      bgcolor: selected.priority === 'urgent' ? 'error.main' :
                              selected.priority === 'high' ? 'warning.main' :
                              selected.priority === 'medium' ? 'warning.light' : 'success.main',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}
                  />
                </Box>
              </Paper>
            )}

            {selected.category && (
              <Paper sx={{ mb: 1.5, p: 1.5, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    Category:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {selected.category}
                  </Typography>
                </Box>
              </Paper>
            )}

            {selected.timing && (
              <Paper sx={{ mb: 1.5, p: 1.5, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    Timing:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {selected.timing}
                  </Typography>
                </Box>
              </Paper>
            )}

            {selected.evidence && selected.evidence.length > 0 && (
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: 'text.primary' }}>
                  Clinical Evidence:
                </Typography>
                <Box component="ul" sx={{ m: 0, p: 0, pl: 2 }}>
                  {selected.evidence.map((evidence, i) => (
                    <Typography 
                      key={i} 
                      component="li" 
                      variant="caption" 
                      sx={{ 
                        color: 'text.primary', 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: 1,
                        mb: 0.5
                      }}
                    >
                      <Typography component="span" sx={{ color: 'primary.main', mt: 0.25 }}>•</Typography>
                      {evidence}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        )}
      </Box>

      {/* Layout Controls Dialog */}
      <Dialog 
        open={layoutDialogOpen} 
        onClose={() => setLayoutDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Settings />
            <Typography variant="h6">Layout Controls</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {/* Layout Type Selector */}
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
                Layout Type
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={layoutType}
                  onChange={(e) => setLayoutType(e.target.value as LayoutType)}
                  sx={{
                    bgcolor: 'background.paper',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <MenuItem value="smart">Smart Layout</MenuItem>
                  <MenuItem value="force">Force-Directed</MenuItem>
                  <MenuItem value="hierarchical">Hierarchical</MenuItem>
                  <MenuItem value="circular">Circular</MenuItem>
                  <MenuItem value="grid">Grid</MenuItem>
                  <MenuItem value="preset">Preset</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Layout Configuration Sliders */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
                  Node Repulsion: {layoutConfig.nodeRepulsion}
                </Typography>
                <Slider
                  value={layoutConfig.nodeRepulsion}
                  onChange={(_, value) => setLayoutConfig(prev => ({ ...prev, nodeRepulsion: value as number }))}
                  min={1000}
                  max={50000}
                  step={1000}
                  sx={{
                    color: 'primary.main',
                    '& .MuiSlider-track': {
                      bgcolor: 'divider',
                    },
                    '& .MuiSlider-thumb': {
                      bgcolor: 'primary.main',
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
                  Edge Length: {layoutConfig.idealEdgeLength}
                </Typography>
                <Slider
                  value={layoutConfig.idealEdgeLength}
                  onChange={(_, value) => setLayoutConfig(prev => ({ ...prev, idealEdgeLength: value as number }))}
                  min={50}
                  max={500}
                  step={10}
                  sx={{
                    color: 'primary.main',
                    '& .MuiSlider-track': {
                      bgcolor: 'divider',
                    },
                    '& .MuiSlider-thumb': {
                      bgcolor: 'primary.main',
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
                  Gravity: {layoutConfig.gravity}
                </Typography>
                <Slider
                  value={layoutConfig.gravity}
                  onChange={(_, value) => setLayoutConfig(prev => ({ ...prev, gravity: value as number }))}
                  min={0}
                  max={1}
                  step={0.01}
                  sx={{
                    color: 'primary.main',
                    '& .MuiSlider-track': {
                      bgcolor: 'divider',
                    },
                    '& .MuiSlider-thumb': {
                      bgcolor: 'primary.main',
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
                  Iterations: {layoutConfig.numIter}
                </Typography>
                <Slider
                  value={layoutConfig.numIter}
                  onChange={(_, value) => setLayoutConfig(prev => ({ ...prev, numIter: value as number }))}
                  min={100}
                  max={3000}
                  step={100}
                  sx={{
                    color: 'primary.main',
                    '& .MuiSlider-track': {
                      bgcolor: 'divider',
                    },
                    '& .MuiSlider-thumb': {
                      bgcolor: 'primary.main',
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLayoutDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={resetView} variant="outlined">
            Reset View
          </Button>
          <Button onClick={applyLayout} variant="contained">
            Apply Layout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Problem List Dialog */}
      <ProblemList
        open={problemListOpen}
        onClose={() => setProblemListOpen(false)}
        problemList={problemList}
      />
    </Box>
  );
}
