import dagre from 'dagre';
import type { DiagnosisNode, DiagnosisEdge } from '../types';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export const getLayoutedElements = (
  nodes: DiagnosisNode[],
  edges: DiagnosisEdge[],
  direction = 'LR'
) => {
  const nodeWidth = 200;
  const nodeHeight = 80;

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { nodes: layoutedNodes, edges };
};

// Enhanced force-directed layout with clustering
export const getForceLayoutedElements = (
  nodes: DiagnosisNode[],
  edges: DiagnosisEdge[],
  options: {
    nodeRepulsion?: number;
    idealEdgeLength?: number;
    gravity?: number;
    clustering?: boolean;
  } = {}
) => {
  const {
    clustering = true
  } = options;

  // Group nodes by type for clustering
  const nodeGroups = clustering ? groupNodesByType(nodes) : { all: nodes };
  
  // Calculate cluster centers
  const clusterCenters = clustering ? calculateClusterCenters(nodeGroups) : {};
  
  // Apply clustering adjustments to positions
  const adjustedNodes = nodes.map(node => {
    if (!clustering) return node;
    
    const nodeType = node.data.type;
    const clusterCenter = clusterCenters[nodeType];
    
    if (clusterCenter && node.position) {
      // Add some randomness within the cluster
      const randomOffset = {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100
      };
      
      return {
        ...node,
        position: {
          x: clusterCenter.x + randomOffset.x,
          y: clusterCenter.y + randomOffset.y
        }
      };
    }
    
    return node;
  });

  return { nodes: adjustedNodes, edges };
};

// Group nodes by their type
const groupNodesByType = (nodes: DiagnosisNode[]) => {
  const groups: Record<string, DiagnosisNode[]> = {};
  
  nodes.forEach(node => {
    const type = node.data.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(node);
  });
  
  return groups;
};

// Calculate cluster centers based on node types
const calculateClusterCenters = (nodeGroups: Record<string, DiagnosisNode[]>) => {
  const centers: Record<string, { x: number; y: number }> = {};
  const canvasWidth = 1200;
  const canvasHeight = 800;
  
  const groupTypes = Object.keys(nodeGroups);
  const spacing = canvasWidth / (groupTypes.length + 1);
  
  groupTypes.forEach((type, index) => {
    const x = spacing * (index + 1);
    const y = canvasHeight / 2;
    
    centers[type] = { x, y };
  });
  
  return centers;
};

// Smart layout that chooses the best algorithm based on graph characteristics
export const getSmartLayout = (
  nodes: DiagnosisNode[],
  edges: DiagnosisEdge[]
) => {
  const nodeCount = nodes.length;
  const hasHierarchy = edges.some(edge => edge.type === 'next-step');
  
  // Choose layout based on graph characteristics
  if (nodeCount <= 5) {
    // Small graphs: use force-directed for flexibility
    return getForceLayoutedElements(nodes, edges, {
      nodeRepulsion: 15000,
      idealEdgeLength: 200,
      gravity: 0.2,
      clustering: false
    });
  } else if (hasHierarchy && nodeCount <= 15) {
    // Medium hierarchical graphs: use dagre
    return getLayoutedElements(nodes, edges, 'TB');
  } else if (nodeCount > 15) {
    // Large graphs: use force-directed with clustering
    return getForceLayoutedElements(nodes, edges, {
      nodeRepulsion: 30000,
      idealEdgeLength: 300,
      gravity: 0.05,
      clustering: true
    });
  } else {
    // Default: force-directed
    return getForceLayoutedElements(nodes, edges);
  }
};

export type LayoutType = 'smart' | 'force' | 'hierarchical' | 'circular' | 'grid' | 'preset';

export interface LayoutConfig {
  nodeRepulsion: number;
  idealEdgeLength: number;
  gravity: number;
  numIter: number;
}

export const defaultLayoutConfig: LayoutConfig = {
  nodeRepulsion: 25000,
  idealEdgeLength: 250,
  gravity: 0.1,
  numIter: 1000,
};

export function getForceLayout(): any {
  return {
    name: 'cose',
    fit: true,
    padding: 50,
    stop: function() {},
    ready: function() {},
  };
}

export function getHierarchicalLayout(): any {
  return {
    name: 'dagre',
    fit: true,
    padding: 50,
    stop: function() {},
    ready: function() {},
  };
}

export function getCircularLayout(): any {
  return {
    name: 'circle',
    fit: true,
    padding: 50,
    stop: function() {},
    ready: function() {},
  };
}

export function getGridLayout(): any {
  return {
    name: 'grid',
    fit: true,
    padding: 50,
    stop: function() {},
    ready: function() {},
  };
}