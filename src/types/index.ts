export type NodePosition = {
  x: number;
  y: number;
};

export type NodeType = 'diagnosis' | 'next_action' | 'completed';

export interface DiagnosisNodeData extends Record<string, unknown> {
  label: string;
  type: NodeType;
  details?: string;
  confidence?: number;
  likelihood?: number;
  evidence?: string[];
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  category?: string;
  timing?: string;
  group_name?: string;
  related_diagnosis_id?: string;
}

export interface DiagnosisNode {
  id: string;
  position: NodePosition;
  data: DiagnosisNodeData;
}

export interface DiagnosisEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'next-step' | 'supports' | 'excludes' | 'related';
}

export interface AnalysisResponse {
  nodes: DiagnosisNode[];
  edges: DiagnosisEdge[];
  metadata?: {
    processing_time?: number;
    confidence?: number;
    model_used?: string;
  };
}

export interface DiagnosisState {
  note: string;
  graph: {
    nodes: DiagnosisNode[];
    edges: DiagnosisEdge[];
  };
  isLoading: boolean;
  error: string | null;
  apiKey: string;
  setNote: (note: string) => void;
  setGraph: (graph: { nodes: DiagnosisNode[]; edges: DiagnosisEdge[] }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setApiKey: (apiKey: string) => void;
  analyzeNote: (note: string) => Promise<void>;
}