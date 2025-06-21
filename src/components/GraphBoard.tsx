import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import type { Core } from 'cytoscape';
import { useEffect, useState } from 'react';
import { useDiagStore } from '../store/diagStore';
import type { DiagnosisNode, DiagnosisEdge } from '../types';

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

export function GraphBoard() {
  const { graph } = useDiagStore();
  const [elements, setElements] = useState<cytoscape.ElementDefinition[]>([]);
  const [selected, setSelected] = useState<SelectedInfo | null>(null);

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

  useEffect(() => {
    console.log('GraphBoard: graph updated', { nodeCount: graph.nodes.length, edgeCount: graph.edges.length });
    
    const nodes = (graph.nodes.length > 0 ? graph.nodes : testNodes).map((n) => ({
      data: {
        id: n.id,
        ...n.data,
      },
      position: n.position,
      selectable: true,
      grabbable: true,
      classes: n.data.type
    }));

    const edges = (graph.nodes.length > 0 ? graph.edges : testEdges).map((e) => ({
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label
      }
    }));

    console.log('GraphBoard: setting elements', { nodes: nodes.length, edges: edges.length });
    setElements([...nodes, ...edges]);
  }, [graph]);

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
        'background-color': 'transparent',
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
        'background-color': 'transparent',
        'border-color': '#34C759',
        'color': '#1C1C1E'
      }
    },
    {
      selector: 'node.next_action[category="monitoring"]',
      style: {
        'background-color': 'transparent',
        'border-color': '#FF9500',
        'color': '#1C1C1E'
      }
    },
    {
      selector: 'node.next_action[category="consultation"]',
      style: {
        'background-color': 'transparent',
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

  const layout = { 
    name: graph.nodes.length > 0 ? 'preset' : 'cose',
    fit: true, 
    padding: 60,
    // Force-directed layout parameters
    nodeRepulsion: function() { return 15000; },
    nodeOverlap: 20,
    idealEdgeLength: function() { return 200; },
    edgeElasticity: function() { return 100; },
    nestingFactor: 1.2,
    gravity: 0.25,
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0,
    // Animation
    animate: true,
    animationDuration: 1000,
    animationEasing: 'ease-out',
    // Randomization
    randomize: false,
    componentSpacing: 100,
    boundingBox: undefined,
    transform: function(_node: any, position: any) { return position; },
    ready: undefined,
    stop: undefined
  };

  const handleCy = (cy: Core) => {
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
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        layout={layout}
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
