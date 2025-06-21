import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import type { Core } from 'cytoscape';
import { useEffect, useState, useCallback } from 'react';
import { useDiagStore } from '../store/diagStore';
import type { DiagnosisNode, DiagnosisEdge } from '../types';
import { getLayoutedElements, getSmartLayout } from '../utils/layout';

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
  const { graph } = useDiagStore();
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
  }, [layoutType, getSmartLayoutConfig, getForceLayout, getHierarchicalLayout, getCircularLayout, getGridLayout, getPresetLayout]);

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

  const stylesheet = [
    {
      selector: 'node',
      style: {
        label: 'data(label)',
        'text-wrap': 'wrap',
        'text-max-width': 160,
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': 11,
        'font-weight': '500',
        'border-width': 1,
        'box-shadow': '0 1px 4px rgba(0,0,0,0.08)',
        'transition-property': 'background-color, border-color, box-shadow, width, height, transform',
        'transition-duration': '120ms',
        'transition-timing-function': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }
    },
    {
      selector: 'node:hover',
      style: {
        'box-shadow': '0 1px 4px rgba(0,0,0,0.08)',
        transform: 'scale(1.02)'
      }
    },
    {
      selector: 'node.diagnosis',
      style: {
        'shape': 'ellipse',
        'width': (ele: any) => Math.max(80, Math.min(200, 80 + (ele.data('likelihood') || 0.5) * 120)),
        'height': (ele: any) => Math.max(80, Math.min(200, 80 + (ele.data('likelihood') || 0.5) * 120)),
        'background-color': '#FFFFFF',
        'border-color': '#CED0D4',
        'color': '#1C1C1E',
        'font-size': (ele: any) => Math.max(10, Math.min(14, 10 + (ele.data('likelihood') || 0.5) * 4))
      }
    },
    {
      selector: 'node.next_action',
      style: {
        'shape': 'triangle',
        'width': 60,
        'height': 60,
        'background-color': '#FFF8F0',
        'border-color': '#FF9500',
        'color': '#1C1C1E',
        'font-size': 9,
        'text-max-width': 120
      }
    },
    {
      selector: 'node.next_action[category="diagnostic"]',
      style: {
        'background-color': '#e0f2fe',
        'border-color': '#0ea5e9',
        'color': '#0c4a6e'
      }
    },
    {
      selector: 'node.next_action[category="therapeutic"]',
      style: {
        'background-color': '#f0fdf4',
        'border-color': '#34C759',
        'color': '#1C1C1E'
      }
    },
    {
      selector: 'node.next_action[category="monitoring"]',
      style: {
        'background-color': '#fffbeb',
        'border-color': '#FF9500',
        'color': '#1C1C1E'
      }
    },
    {
      selector: 'node.next_action[category="consultation"]',
      style: {
        'background-color': '#fef2f2',
        'border-color': '#FF3B30',
        'color': '#1C1C1E'
      }
    },
    {
      selector: 'node.completed',
      style: {
        'background-color': '#d1fae5',
        'border-color': '#10b981',
        'color': '#059669',
        'text-decoration': 'line-through',
        'opacity': 0.7
      }
    },
    {
      selector: 'edge',
      style: {
        width: 1,
        'line-color': '#E5E5E5',
        'target-arrow-color': '#E5E5E5',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.2,
        label: 'data(label)',
        'font-size': 10,
        'font-weight': '500',
        'text-background-color': '#FFFFFF',
        'text-background-opacity': 0.9,
        'text-background-padding': 3,
        'curve-style': 'bezier',
        'control-point-step-size': 40
      }
    },
    {
      selector: 'edge:hover',
      style: {
        width: 2,
        'line-color': '#6E6E73',
        'target-arrow-color': '#6E6E73'
      }
    }
  ];

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

  return (
    <div className="flex-1 bg-surface shadow-elevation relative" style={{ height: '80vh', width: '100%' }}>
      {/* Layout Controls */}
      <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-sm rounded-2xl p-4 shadow-elevation z-10">
        <h3 className="font-semibold text-text-primary mb-3">Layout Controls</h3>
        
        {/* Layout Type Selector */}
        <div className="mb-4">
          <label className="block text-caption text-text-secondary mb-2">Layout Type</label>
          <select 
            value={layoutType} 
            onChange={(e) => setLayoutType(e.target.value as LayoutType)}
            className="w-full px-3 py-2 border border-separator rounded-lg bg-surface text-text-primary text-sm"
          >
            <option value="smart">Smart (Auto)</option>
            <option value="force">Force-Directed</option>
            <option value="hierarchical">Hierarchical</option>
            <option value="circular">Circular</option>
            <option value="grid">Grid</option>
            <option value="preset">Preset (LLM)</option>
          </select>
        </div>

        {/* Force Layout Controls */}
        {layoutType === 'force' && (
          <div className="space-y-3">
            <div>
              <label className="block text-caption text-text-secondary mb-1">
                Node Repulsion: {layoutConfig.nodeRepulsion}
              </label>
              <input
                type="range"
                min="5000"
                max="50000"
                step="1000"
                value={layoutConfig.nodeRepulsion}
                onChange={(e) => setLayoutConfig(prev => ({ ...prev, nodeRepulsion: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-caption text-text-secondary mb-1">
                Edge Length: {layoutConfig.idealEdgeLength}
              </label>
              <input
                type="range"
                min="100"
                max="500"
                step="25"
                value={layoutConfig.idealEdgeLength}
                onChange={(e) => setLayoutConfig(prev => ({ ...prev, idealEdgeLength: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-caption text-text-secondary mb-1">
                Gravity: {layoutConfig.gravity}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={layoutConfig.gravity}
                onChange={(e) => setLayoutConfig(prev => ({ ...prev, gravity: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-caption text-text-secondary mb-1">
                Iterations: {layoutConfig.numIter}
              </label>
              <input
                type="range"
                min="500"
                max="3000"
                step="100"
                value={layoutConfig.numIter}
                onChange={(e) => setLayoutConfig(prev => ({ ...prev, numIter: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Apply Layout Button */}
        <button
          onClick={() => {
            if (cyInstance && elements.length > 0) {
              const layout = cyInstance.layout(getLayout());
              layout.run();
            }
          }}
          className="w-full mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
        >
          Apply Layout
        </button>

        {/* Reset View Button */}
        <button
          onClick={() => {
            if (cyInstance) {
              cyInstance.fit();
              cyInstance.center();
            }
          }}
          className="w-full mt-2 px-4 py-2 bg-text-secondary/10 text-text-secondary rounded-lg hover:bg-text-secondary/20 transition-colors text-sm font-medium"
        >
          Reset View
        </button>
      </div>

      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        layout={getLayout()}
        cy={handleCy}
        style={{ width: '100%', height: '100%' }}
      />
      {selected && (
        <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm rounded-2xl p-4 max-w-sm text-body shadow-elevation hover:shadow-elevation-hover transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-text-primary">{selected.label}</h3>
            {selected.type === 'diagnosis' && (
              <span className="bg-diagnosis/10 text-diagnosis px-2 py-1 rounded-full text-caption">
                Diagnosis
              </span>
            )}
            {selected.type === 'next_action' && (
              <span className="bg-action/10 text-action px-2 py-1 rounded-full text-caption">
                Action
              </span>
            )}
          </div>
          
          {selected.group_name && (
            <p className="text-text-secondary mb-2 text-caption">Group: {selected.group_name}</p>
          )}
          
          {selected.details && <p className="mb-2 text-text-primary">{selected.details}</p>}
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            {selected.likelihood && (
              <div className="text-center p-2 bg-diagnosis/5 rounded border border-separator">
                <div className="text-caption text-text-secondary">Likelihood</div>
                <div className="font-semibold text-diagnosis">
                  {Math.round(selected.likelihood * 100)}%
                </div>
              </div>
            )}
            {selected.confidence && (
              <div className="text-center p-2 bg-differential/5 rounded border border-separator">
                <div className="text-caption text-text-secondary">Confidence</div>
                <div className="font-semibold text-differential">
                  {Math.round(selected.confidence * 100)}%
                </div>
              </div>
            )}
          </div>
          
          {selected.priority && (
            <p className="mb-2 text-text-primary">
              <span className="font-medium">Priority:</span> 
              <span className={`ml-1 px-2 py-1 rounded text-caption ${
                selected.priority === 'urgent' ? 'bg-action/10 text-action' :
                selected.priority === 'high' ? 'bg-action/10 text-action' :
                selected.priority === 'medium' ? 'bg-differential/10 text-differential' :
                'bg-text-secondary/10 text-text-secondary'
              }`}>
                {selected.priority}
              </span>
            </p>
          )}
          
          {selected.category && (
            <p className="mb-2 text-text-primary">
              <span className="font-medium">Category:</span> <span className="text-text-secondary">{selected.category}</span>
            </p>
          )}
          
          {selected.timing && (
            <p className="mb-2 text-text-primary">
              <span className="font-medium">Timing:</span> <span className="text-text-secondary">{selected.timing}</span>
            </p>
          )}
          
          {selected.evidence && selected.evidence.length > 0 && (
            <div>
              <div className="font-medium mb-1 text-text-primary">Clinical Evidence:</div>
              <ul className="list-disc pl-5 space-y-1">
                {selected.evidence.map((e, i) => (
                  <li key={i} className="text-text-secondary text-caption">{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
