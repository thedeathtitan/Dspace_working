import type { DiagnosisNode, DiagnosisEdge, ProblemListItem } from '../types';
import { analyzeWithMCP } from './mcpClient';

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

// Enhanced function calling schema for comprehensive medical reasoning
const DIAGNOSIS_SCHEMA = {
  name: 'generate_comprehensive_diagnosis_workflow',
  description: 'Analyze clinical note and generate diagnosis groups with likelihood-based sizing, next action nodes, and billable problem list',
  parameters: {
    type: 'object',
    properties: {
      diagnosis_groups: {
        type: 'array',
        description: 'Groups of possible diagnoses organized by likelihood and clinical category',
        minItems: 1,
        maxItems: 6,
        items: {
          type: 'object',
          properties: {
            group_id: { type: 'string', description: 'Unique group identifier' },
            group_name: { type: 'string', description: 'Descriptive name for the diagnosis group' },
            diagnoses: {
              type: 'array',
              description: 'Diagnoses within this group',
              minItems: 1,
              maxItems: 6,
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'Unique identifier' },
                  label: { type: 'string', description: 'Diagnosis name' },
                  type: { type: 'string', enum: ['diagnosis'], description: 'Node type' },
                  likelihood: { type: 'number', minimum: 0.1, maximum: 1.0, description: 'Likelihood score 0.1-1.0 for node sizing' },
                  confidence: { type: 'number', minimum: 0.1, maximum: 1.0, description: 'Confidence in diagnosis' },
                  evidence: { 
                    type: 'array', 
                    items: { type: 'string' }, 
                    description: 'Supporting clinical findings from the note',
                    minItems: 1
                  },
                  details: { type: 'string', description: 'Clinical reasoning and pathophysiology' },
                  category: { type: 'string', description: 'Medical category (e.g., cardiac, pulmonary, infectious)' }
                },
                required: ['id', 'label', 'type', 'likelihood', 'confidence', 'evidence', 'details', 'category']
              }
            }
          },
          required: ['group_id', 'group_name', 'diagnoses']
        }
      },
      next_actions: {
        type: 'array',
        description: 'Next action nodes that surround diagnoses - tests, treatments, monitoring',
        minItems: 2,
        maxItems: 15,
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique identifier' },
            label: { type: 'string', description: 'Action description' },
            type: { type: 'string', enum: ['next_action'], description: 'Node type for triangular visualization' },
            priority: { type: 'string', enum: ['urgent', 'high', 'medium', 'low'], description: 'Action priority' },
            details: { type: 'string', description: 'Why this action is recommended' },
            category: { type: 'string', enum: ['diagnostic', 'therapeutic', 'monitoring', 'consultation'], description: 'Action category' },
            timing: { type: 'string', description: 'When this should be done' },
            related_diagnosis_id: { type: 'string', description: 'ID of the diagnosis this action relates to most closely' }
          },
          required: ['id', 'label', 'type', 'priority', 'details', 'category', 'related_diagnosis_id']
        }
      },
      relationships: {
        type: 'array',
        description: 'Clinical relationships between diagnoses and actions - create comprehensive connections',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique edge identifier' },
            source: { type: 'string', description: 'Source node ID' },
            target: { type: 'string', description: 'Target node ID' },
            relationship: { 
              type: 'string', 
              enum: ['confirms', 'rules-out', 'monitors', 'treats', 'investigates'],
              description: 'Clinical relationship type' 
            },
            label: { type: 'string', description: 'Brief relationship description' },
            strength: { type: 'string', enum: ['strong', 'moderate', 'weak'], description: 'Relationship strength' }
          },
          required: ['id', 'source', 'target', 'relationship', 'label']
        }
      },
      problem_list: {
        type: 'array',
        description: 'Billable problem list with ICD-10 codes for the most likely diagnoses',
        minItems: 1,
        maxItems: 10,
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique identifier for the problem list item' },
            diagnosis: { type: 'string', description: 'Clinical diagnosis name' },
            icd10Code: { type: 'string', description: 'Corresponding ICD-10 diagnosis code' },
            likelihood: { type: 'number', minimum: 0.1, maximum: 1.0, description: 'Probability of this diagnosis' },
            category: { type: 'string', description: 'Medical category (e.g., cardiac, pulmonary, infectious)' },
            evidence: { 
              type: 'array', 
              items: { type: 'string' }, 
              description: 'Key clinical findings supporting this diagnosis',
              minItems: 1
            },
            status: { 
              type: 'string', 
              enum: ['active', 'resolved', 'ruled-out'], 
              description: 'Current status of this problem',
              default: 'active'
            }
          },
          required: ['id', 'diagnosis', 'icd10Code', 'likelihood', 'category', 'evidence', 'status']
        }
      }
    },
    required: ['diagnosis_groups', 'next_actions', 'relationships', 'problem_list']
  }
};

export interface OpenAIResponse {
  nodes: DiagnosisNode[];
  edges: DiagnosisEdge[];
  problemList?: ProblemListItem[];
}

export async function analyzeWithOpenAI(clinicalNote: string, apiKey: string, retryCount = 0): Promise<OpenAIResponse> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (!clinicalNote.trim()) {
    throw new Error('Clinical note cannot be empty');
  }

  try {
    // Use MCP client for bulletproof JSON handling
    const mcpResponse = await analyzeWithMCP(clinicalNote, apiKey);
    
    // Transform MCP response to the expected format
    const nodes: DiagnosisNode[] = mcpResponse.nodes.map((node, index) => ({
      id: node.id,
      position: { x: 100 + (index * 200), y: 100 + (index * 100) },
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
        likelihood: node.likelihood || 0.5,
        confidence: node.confidence || 0.5,
        evidence: node.evidence || [],
        details: node.details || '',
        category: node.category || 'general',
        priority: (node.priority || 'medium') as 'urgent' | 'high' | 'medium' | 'low',
        timing: node.timing || '',
        related_diagnosis_id: node.related_diagnosis_id || ''
      }
    }));

    const edges: DiagnosisEdge[] = mcpResponse.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'related'
    }));

    const problemList: ProblemListItem[] = mcpResponse.problemList.map(problem => ({
      id: problem.id,
      diagnosis: problem.diagnosis,
      icd10Code: problem.icd10Code,
      likelihood: problem.likelihood,
      category: problem.category,
      evidence: problem.evidence,
      status: problem.status as 'active' | 'resolved' | 'ruled-out'
    }));

    return { nodes, edges, problemList };
  } catch (error) {
    console.error('MCP analysis failed, falling back to direct OpenAI call:', error);
    
    // Fallback to original implementation if MCP fails
    return await analyzeWithOpenAIFallback(clinicalNote, apiKey, retryCount);
  }
}

// Original implementation as fallback
async function analyzeWithOpenAIFallback(clinicalNote: string, apiKey: string, retryCount = 0): Promise<OpenAIResponse> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (!clinicalNote.trim()) {
    throw new Error('Clinical note cannot be empty');
  }

  const systemPrompt = `You are an expert emergency medicine physician and clinical decision support system with deep medical knowledge. 

Your task is to analyze clinical presentations and create organized diagnosis groups with likelihood-based visualization, surrounding next action nodes, and a billable problem list.

CRITICAL REQUIREMENTS:
1. Create 2-4 diagnosis groups (e.g., "Cardiac", "Pulmonary", "Infectious", "Neurologic")
2. Each group should contain 1-4 related diagnoses with likelihood scores 0.1-1.0
3. Generate 4-12 next action nodes that relate to specific diagnoses
4. Likelihood scores determine node size in visualization (higher = larger circles)
5. Next actions will be displayed as triangular nodes surrounding diagnoses
6. Create a billable problem list with ICD-10 codes for the most likely diagnoses

DIAGNOSIS GROUPS STRUCTURE:
- Organize diagnoses by medical system or pathophysiology
- Assign likelihood scores based on clinical probability
- Higher likelihood = more probable diagnosis = larger node
- Include evidence from clinical note for each diagnosis

NEXT ACTIONS APPROACH:
- Create specific, actionable next steps
- Link each action to a related diagnosis ID
- Include diagnostic tests, treatments, monitoring, consultations
- Vary priorities from urgent to low
- Actions will surround their related diagnoses visually

PROBLEM LIST REQUIREMENTS:
- Include the 3-8 most likely diagnoses based on clinical presentation
- Provide accurate ICD-10 diagnosis codes for each problem
- Assign likelihood scores (0.1-1.0) based on clinical probability
- Include key evidence supporting each diagnosis
- Set status as 'active' for current problems
- Focus on billable, actionable diagnoses`;

  const userPrompt = `Clinical Presentation: ${clinicalNote}

Create organized diagnosis groups with likelihood-based sizing, surrounding next action nodes, and a billable problem list:

1. DIAGNOSIS GROUPS (2-4 groups): Organize possible diagnoses by medical category
   - Each diagnosis needs a likelihood score (0.1-1.0) for visual sizing
   - Include clinical evidence supporting each diagnosis

2. NEXT ACTION NODES (4-12 actions): Specific next steps for each diagnosis
   - Link each action to a related diagnosis ID
   - Include tests, treatments, monitoring, consultations
   - Vary priorities and timing appropriately

3. CLINICAL RELATIONSHIPS: Connect diagnoses to their relevant actions

4. PROBLEM LIST (3-8 items): Billable problem list with ICD-10 codes
   - Include the most likely diagnoses based on clinical presentation
   - Provide accurate ICD-10 diagnosis codes for billing
   - Assign likelihood scores based on clinical probability
   - Include key evidence supporting each diagnosis
   - Focus on actionable, billable diagnoses
   - Where possible, include severe protein calorie malnutrition, frailty, and other chronic problems to maximize revenue

Think systematically about this patient's presentation. Group related diagnoses together, identify key next steps, and create a comprehensive problem list for billing and documentation.

VISUALIZATION NOTE: Diagnoses will be circles (size = likelihood), next actions will be triangles surrounding them.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'o3',  // Updated to use full o3 reasoning model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: DIAGNOSIS_SCHEMA
        }],
        tool_choice: { type: 'function', function: { name: 'generate_comprehensive_diagnosis_workflow' } },
        max_completion_tokens: 4000,   // Correct parameter for OpenAI API
        temperature: 1    // Standard temperature for creative medical reasoning
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Comprehensive logging for debugging
    console.log('OpenAI Response Debug:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasMessage: !!data.choices?.[0]?.message,
      messageKeys: Object.keys(data.choices?.[0]?.message || {}),
      hasToolCalls: !!data.choices?.[0]?.message?.tool_calls,
      hasContent: !!data.choices?.[0]?.message?.content,
      fullResponse: JSON.stringify(data, null, 2)
    });

    // Defensive response parsing
    const call = data.choices?.[0]?.message?.tool_calls?.[0]?.function;
    
    // Handle missing tool_calls entirely (service-side omissions)
    if (!data.choices?.[0]?.message?.tool_calls) {
      console.error('No tool_calls in response - this may be a service-side omission');
      
      // Retry once if tool_calls is missing
      if (retryCount === 0) {
        console.log('Retrying OpenAI request due to missing tool_calls...');
        return analyzeWithOpenAIFallback(clinicalNote, apiKey, 1);
      }
      
      throw new Error('OpenAI returned no tool_calls - model may have responded in plain text');
    }
    
    let args = call?.arguments;

    // Handle stringified JSON arguments (common issue)
    if (typeof args === 'string') {
      try {
        args = JSON.parse(args);
        console.log('Successfully parsed stringified JSON arguments');
      } catch (parseError) {
        console.error('Failed to parse stringified arguments:', parseError);
        console.error('Raw arguments:', args);
        throw new Error('Invalid JSON in function arguments');
      }
    }

    if (!args?.diagnosis_groups) {
      console.error('Missing diagnosis_groups in response. Available keys:', Object.keys(args || {}));
      console.error('Full response structure:', data);
      
      // Retry once on format issues
      if (retryCount === 0) {
        console.log('Retrying OpenAI request due to bad format...');
        return analyzeWithOpenAIFallback(clinicalNote, apiKey, 1);
      }
      
      throw new Error('OpenAI returned incomplete response structure - missing diagnosis_groups');
    }

    const functionResponse = args;
    
    // Create layout with diagnosis groups and surrounding action nodes
    const createGroupedLayout = () => {
      const nodes: DiagnosisNode[] = [];
      const diagnosisGroups = functionResponse.diagnosis_groups || [];
      const nextActions = functionResponse.next_actions || [];
      
      // Position diagnosis groups across the canvas
      diagnosisGroups.forEach((group: any, groupIndex: number) => {
        const groupCenterX = 200 + (groupIndex * 800);
        const groupCenterY = 300;
        
        // Position diagnoses within each group
        group.diagnoses.forEach((diagnosis: any, diagIndex: number) => {
          const angle = (diagIndex * 2 * Math.PI) / group.diagnoses.length;
          const radius = 50 + (group.diagnoses.length * 10);
          
          nodes.push({
            id: diagnosis.id,
            position: {
              x: groupCenterX + Math.cos(angle) * radius,
              y: groupCenterY + Math.sin(angle) * radius
            },
            data: {
              label: diagnosis.label,
              type: 'diagnosis',
              likelihood: diagnosis.likelihood,
              confidence: diagnosis.confidence,
              evidence: diagnosis.evidence,
              details: diagnosis.details,
              category: diagnosis.category,
              group_name: group.group_name
            }
          });
        });
      });
      
      // Position next actions around their related diagnoses
      nextActions.forEach((action: any) => {
        const relatedDiagnosis = nodes.find(n => n.id === action.related_diagnosis_id);
        if (relatedDiagnosis) {
          // Calculate position around the diagnosis
          const angle = Math.random() * 2 * Math.PI;
          const distance = 150 + Math.random() * 50;
          
          nodes.push({
            id: action.id,
            position: {
              x: relatedDiagnosis.position.x + Math.cos(angle) * distance,
              y: relatedDiagnosis.position.y + Math.sin(angle) * distance
            },
            data: {
              label: action.label,
              type: 'next_action',
              priority: action.priority,
              details: action.details,
              category: action.category,
              timing: action.timing,
              related_diagnosis_id: action.related_diagnosis_id
            }
          });
        }
      });
      
      return nodes;
    };
    
    const nodes = createGroupedLayout();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const edges: DiagnosisEdge[] = functionResponse.relationships.map((rel: any) => ({
      id: rel.id,
      source: rel.source,
      target: rel.target,
      label: rel.label,
      type: rel.relationship
    }));

    // Extract problem list from response
    const problemList: ProblemListItem[] = functionResponse.problem_list?.map((problem: any) => ({
      id: problem.id,
      diagnosis: problem.diagnosis,
      icd10Code: problem.icd10Code,
      likelihood: problem.likelihood,
      category: problem.category,
      evidence: problem.evidence,
      status: problem.status || 'active'
    })) || [];

    console.log(`Generated ${nodes.length} nodes, ${edges.length} edges, and ${problemList.length} problem list items`);
    return { nodes, edges, problemList };

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to analyze clinical note with OpenAI');
  }
}

export async function transcribeWithWhisper(audioBlob: Blob, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (!audioBlob || audioBlob.size === 0) {
    throw new Error('Audio data is required');
  }

  // Check file size (Whisper has 25MB limit)
  if (audioBlob.size > 25 * 1024 * 1024) {
    throw new Error('Audio file too large. Maximum size is 25MB.');
  }

  try {
    // Determine appropriate file extension based on MIME type
    let fileName = 'recording.webm';
    let mimeType = audioBlob.type;
    
    if (mimeType.includes('webm')) {
      fileName = 'recording.webm';
    } else if (mimeType.includes('mp4')) {
      fileName = 'recording.mp4';
    } else if (mimeType.includes('wav')) {
      fileName = 'recording.wav';
    } else if (mimeType.includes('opus')) {
      fileName = 'recording.opus';
    }

    console.log(`Transcribing audio: ${fileName}, size: ${audioBlob.size} bytes, type: ${mimeType}`);

    const formData = new FormData();
    formData.append('file', audioBlob, fileName);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('response_format', 'text');
    
    // Add temperature for more consistent results
    formData.append('temperature', '0');

    const response = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData
    });

    if (!response.ok) {
      let errorMessage = 'Unknown error';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        // If parsing JSON fails, use status text
        errorMessage = response.statusText;
      }
      
      // Provide more specific error messages
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 413) {
        throw new Error('Audio file too large. Please record shorter clips.');
      } else if (response.status === 400) {
        throw new Error(`Invalid audio format or request: ${errorMessage}`);
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      
      throw new Error(`Whisper API error (${response.status}): ${errorMessage}`);
    }

    const transcription = await response.text();
    const cleanedTranscription = transcription.trim();
    
    if (!cleanedTranscription) {
      throw new Error('No speech detected in the audio. Please try speaking more clearly.');
    }

    console.log(`Transcription successful: "${cleanedTranscription.substring(0, 100)}${cleanedTranscription.length > 100 ? '...' : ''}"`);
    return cleanedTranscription;

  } catch (error) {
    console.error('Transcription error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to transcribe audio with Whisper');
  }
}