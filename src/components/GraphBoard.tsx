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
  priority?: string;
  evidence?: string[];
  category?: string;
  timing?: string;
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
        label: 'Test Node 1',
        type: 'diagnosis',
        confidence: 0.9,
        details: 'This is a test node'
      }
    },
    {
      id: 'test-2',
      position: { x: 300, y: 100 },
      data: {
        label: 'Test Node 2',
        type: 'action',
        priority: 'high',
        details: 'This is another test node'
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
        'text-max-width': 200,
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': '#ffffff',
        'border-width': 4,
        'border-color': '#e5e7eb',
        'font-size': 12,
        'font-weight': 'bold',
        'color': '#374151',
        'shape': 'round-rectangle',
        'width': 180,
        'height': 80,
        'padding': 10,
        'box-shadow': '0 4px 12px rgba(0,0,0,0.15)',
        'transition-property': 'background-color, border-color, box-shadow',
        'transition-duration': '0.2s'
      }
    },
    {
      selector: 'node:hover',
      style: {
        'box-shadow': '0 8px 25px rgba(0,0,0,0.25)',
        'border-width': 5
      }
    },
    {
      selector: 'node.diagnosis',
      style: {
        'background-color': '#fee2e2',
        'border-color': '#dc2626',
        'color': '#991b1b'
      }
    },
    {
      selector: 'node.differential',
      style: {
        'background-color': '#dbeafe',
        'border-color': '#2563eb',
        'color': '#1e40af'
      }
    },
    {
      selector: 'node.action',
      style: {
        'background-color': '#fef3c7',
        'border-color': '#f59e0b',
        'color': '#92400e'
      }
    },
    {
      selector: 'node.completed',
      style: {
        'background-color': '#d1fae5',
        'border-color': '#10b981',
        'color': '#059669',
        'text-decoration': 'line-through'
      }
    },
    {
      selector: 'node.diagnostic',
      style: {
        'background-color': '#f3e8ff',
        'border-color': '#8b5cf6',
        'color': '#6d28d9'
      }
    },
    {
      selector: 'node.therapeutic',
      style: {
        'background-color': '#ecfdf5',
        'border-color': '#10b981',
        'color': '#047857'
      }
    },
    {
      selector: 'node.monitoring',
      style: {
        'background-color': '#fff7ed',
        'border-color': '#ea580c',
        'color': '#c2410c'
      }
    },
    {
      selector: 'node.consultation',
      style: {
        'background-color': '#fdf2f8',
        'border-color': '#ec4899',
        'color': '#be185d'
      }
    },
    {
      selector: 'edge',
      style: {
        width: 3,
        'line-color': '#6b7280',
        'target-arrow-color': '#6b7280',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.5,
        label: 'data(label)',
        'font-size': 10,
        'font-weight': 'bold',
        'text-background-color': '#ffffff',
        'text-background-opacity': 0.8,
        'text-background-padding': 3,
        'curve-style': 'bezier',
        'control-point-step-size': 40
      }
    },
    {
      selector: 'edge:hover',
      style: {
        width: 4,
        'line-color': '#374151',
        'target-arrow-color': '#374151'
      }
    }
  ];

  const layout = { 
    name: graph.nodes.length > 0 ? 'preset' : 'cose',
    fit: true, 
    padding: 50,
    nodeRepulsion: 8000,
    idealEdgeLength: 200,
    animate: true,
    animationDuration: 500
  };

  const handleCy = (cy: Core) => {
    cy.on('tap', 'node', (evt: cytoscape.EventObject) => {
      const d = evt.target.data() as SelectedInfo;
      setSelected(d);
    });
  };

  return (
    <div className="flex-1 bg-gray-50 relative" style={{ height: '80vh', width: '100%' }}>
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        layout={layout}
        cy={handleCy}
        style={{ width: '100%', height: '100%' }}
      />
      {selected && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border p-4 max-w-xs text-sm">
          <h3 className="font-semibold mb-2">{selected.label}</h3>
          {selected.details && <p className="mb-2">{selected.details}</p>}
          {selected.confidence && (
            <p className="text-green-700">Confidence: {Math.round(selected.confidence * 100)}%</p>
          )}
          {selected.priority && <p>Priority: {selected.priority}</p>}
          {selected.evidence && selected.evidence.length > 0 && (
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {selected.evidence.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
