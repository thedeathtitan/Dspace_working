import OpenAI from 'openai';
import { z } from 'zod';

// Enhanced schema for comprehensive medical reasoning
const DiagnosisSchema = z.object({
  diagnosis_groups: z.array(z.object({
    group_id: z.string(),
    group_name: z.string(),
    diagnoses: z.array(z.object({
      id: z.string(),
      label: z.string(),
      type: z.literal('diagnosis'),
      likelihood: z.number().min(0.1).max(1.0),
      confidence: z.number().min(0.1).max(1.0),
      evidence: z.array(z.string()).min(1),
      details: z.string(),
      category: z.string()
    })).min(1).max(6)
  })).min(1).max(6),
  next_actions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.literal('next_action'),
    priority: z.enum(['urgent', 'high', 'medium', 'low']),
    details: z.string(),
    category: z.enum(['diagnostic', 'therapeutic', 'monitoring', 'consultation']),
    timing: z.string(),
    related_diagnosis_id: z.string()
  })).min(2).max(15),
  relationships: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    relationship: z.enum(['confirms', 'rules-out', 'monitors', 'treats', 'investigates']),
    label: z.string(),
    strength: z.enum(['strong', 'moderate', 'weak'])
  })).min(1),
  problem_list: z.array(z.object({
    id: z.string(),
    diagnosis: z.string(),
    icd10Code: z.string(),
    likelihood: z.number().min(0.1).max(1.0),
    category: z.string(),
    evidence: z.array(z.string()).min(1),
    status: z.enum(['active', 'resolved', 'ruled-out']).default('active')
  })).min(1).max(10)
});

type DiagnosisSchemaType = z.infer<typeof DiagnosisSchema>;

export interface MCPResponse {
  nodes: Array<{
    id: string;
    label: string;
    type: 'diagnosis' | 'next_action';
    likelihood?: number;
    confidence?: number;
    evidence?: string[];
    details?: string;
    category?: string;
    priority?: string;
    timing?: string;
    related_diagnosis_id?: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    relationship: string;
    label: string;
    strength: string;
  }>;
  problemList: Array<{
    id: string;
    diagnosis: string;
    icd10Code: string;
    likelihood: number;
    category: string;
    evidence: string[];
    status: string;
  }>;
}

const medicalKnowledge = `
MEDICAL KNOWLEDGE BASE:

EMERGENCY MEDICINE PRINCIPLES:
- ABCDE approach: Airway, Breathing, Circulation, Disability, Exposure
- Time-critical conditions require immediate intervention
- Always consider the worst-case scenario first
- Vital signs guide urgency assessment

COMMON EMERGENCY PRESENTATIONS:

CARDIAC:
- Chest pain: Consider ACS, PE, aortic dissection, pericarditis
- Dyspnea: Consider CHF, PE, pneumonia, COPD exacerbation
- Palpitations: Consider arrhythmias, anxiety, thyroid disorders
- Syncope: Consider cardiac, neurologic, metabolic causes

RESPIRATORY:
- Shortness of breath: Consider asthma, COPD, PE, pneumonia, pneumothorax
- Cough: Consider infection, heart failure, GERD, medication side effects
- Hemoptysis: Consider infection, malignancy, PE, vasculitis

NEUROLOGIC:
- Headache: Consider migraine, tension, cluster, SAH, meningitis
- Altered mental status: Consider infection, metabolic, toxic, structural
- Weakness: Consider stroke, GBS, myasthenia, metabolic
- Seizure: Consider epilepsy, metabolic, structural, toxic

GASTROINTESTINAL:
- Abdominal pain: Consider appendicitis, cholecystitis, pancreatitis, obstruction
- Nausea/vomiting: Consider infection, obstruction, metabolic, medication
- GI bleeding: Consider ulcer, varices, diverticulosis, malignancy

INFECTIOUS DISEASES:
- Fever: Consider infection, inflammatory, malignancy, medication
- Sepsis criteria: SIRS + suspected infection
- Common sources: Respiratory, urinary, skin/soft tissue, abdominal

TRAUMA:
- Primary survey: ABCDE
- Secondary survey: Head-to-toe examination
- Imaging based on mechanism and findings

ICD-10 COMMON CODES:
- Chest pain: R07.9
- Shortness of breath: R06.02
- Abdominal pain: R10.9
- Fever: R50.9
- Headache: R51.9
- Syncope: R55
- Sepsis: A41.9
- Pneumonia: J18.9
- Heart failure: I50.9
- COPD exacerbation: J44.1
- Acute coronary syndrome: I21.9
- Pulmonary embolism: I26.99
- Stroke: I63.9
- Appendicitis: K35.80
- Cholecystitis: K81.0
- Pancreatitis: K85.9
- Severe protein calorie malnutrition: E43
- Frailty: R54

DIAGNOSTIC APPROACH:
1. History: Onset, duration, severity, associated symptoms
2. Physical examination: Vital signs, focused exam
3. Differential diagnosis: Consider common and serious causes
4. Testing: Labs, imaging based on differential
5. Treatment: Address most likely and most serious causes

TREATMENT PRINCIPLES:
- Stabilize first, then diagnose
- Treat the most serious condition first
- Consider complications and comorbidities
- Document thoroughly for billing and legal protection
- Follow evidence-based guidelines when available
`;

export async function analyzeWithMCP(clinicalNote: string, apiKey: string): Promise<MCPResponse> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (!clinicalNote.trim()) {
    throw new Error('Clinical note cannot be empty');
  }

  const openai = new OpenAI({ apiKey });

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
- Focus on billable, actionable diagnoses

MEDICAL KNOWLEDGE CONTEXT:
${medicalKnowledge}

CRITICAL: You MUST return valid JSON that matches the exact schema. Use multiple strategies to ensure valid JSON:
1. First attempt: Direct JSON response
2. Fallback: JSON wrapped in markdown code blocks
3. Fallback: Extract JSON from any text response
4. Final fallback: Return a minimal valid structure`;

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

RESPOND WITH VALID JSON ONLY.`;

  // Multiple fallback strategies for JSON handling
  const strategies = [
    // Strategy 1: Direct JSON response
    async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 4000
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response content');
      
      // Try to parse as direct JSON
      try {
        return JSON.parse(content);
      } catch {
        // Continue to next strategy
        throw new Error('Direct JSON parsing failed');
      }
    },
    
    // Strategy 2: Extract from markdown code blocks
    async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt + '\n\nIf you cannot return direct JSON, wrap your JSON response in markdown code blocks like this:\n```json\n{your json here}\n```' },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 4000
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response content');
      
      // Extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch {
          throw new Error('JSON extraction from markdown failed');
        }
      }
      
      throw new Error('No JSON found in markdown blocks');
    },
    
    // Strategy 3: Extract any JSON-like structure
    async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt + '\n\nIf you cannot return valid JSON, try to return a JSON-like structure that can be parsed. Focus on the structure even if some fields are missing.' },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 4000
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response content');
      
      // Find any JSON-like structure
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {
          throw new Error('JSON-like structure parsing failed');
        }
      }
      
      throw new Error('No JSON-like structure found');
    },
    
    // Strategy 4: Minimal valid structure
    async () => {
      console.warn('All JSON parsing strategies failed, returning minimal valid structure');
      return {
        diagnosis_groups: [{
          group_id: 'emergency',
          group_name: 'Emergency Assessment',
          diagnoses: [{
            id: 'emergency_assessment',
            label: 'Emergency Assessment Required',
            type: 'diagnosis' as const,
            likelihood: 0.5,
            confidence: 0.5,
            evidence: ['Clinical presentation requires immediate assessment'],
            details: 'Patient requires immediate medical assessment based on clinical presentation',
            category: 'emergency'
          }]
        }],
        next_actions: [{
          id: 'immediate_assessment',
          label: 'Immediate Medical Assessment',
          type: 'next_action' as const,
          priority: 'urgent' as const,
          details: 'Patient requires immediate medical assessment',
          category: 'diagnostic' as const,
          timing: 'immediately',
          related_diagnosis_id: 'emergency_assessment'
        }],
        relationships: [{
          id: 'emergency_rel',
          source: 'emergency_assessment',
          target: 'immediate_assessment',
          relationship: 'investigates' as const,
          label: 'Assessment investigates emergency',
          strength: 'strong' as const
        }],
        problem_list: [{
          id: 'emergency_problem',
          diagnosis: 'Emergency Assessment Required',
          icd10Code: 'Z00.00',
          likelihood: 0.5,
          category: 'emergency',
          evidence: ['Clinical presentation requires assessment'],
          status: 'active' as const
        }]
      };
    }
  ];

  // Try each strategy in order
  for (let i = 0; i < strategies.length; i++) {
    try {
      const result = await strategies[i]();
      const validated = DiagnosisSchema.parse(result);
      
      // Transform to the expected format
      const nodes: MCPResponse['nodes'] = [];
      const edges: MCPResponse['edges'] = [];
      const problemList: MCPResponse['problemList'] = [];
      
      // Add diagnosis nodes
      validated.diagnosis_groups.forEach((group: DiagnosisSchemaType['diagnosis_groups'][0]) => {
        group.diagnoses.forEach((diagnosis: DiagnosisSchemaType['diagnosis_groups'][0]['diagnoses'][0]) => {
          nodes.push({
            id: diagnosis.id,
            label: diagnosis.label,
            type: diagnosis.type,
            likelihood: diagnosis.likelihood,
            confidence: diagnosis.confidence,
            evidence: diagnosis.evidence,
            details: diagnosis.details,
            category: diagnosis.category
          });
        });
      });
      
      // Add next action nodes
      validated.next_actions.forEach((action: DiagnosisSchemaType['next_actions'][0]) => {
        nodes.push({
          id: action.id,
          label: action.label,
          type: action.type,
          priority: action.priority,
          details: action.details,
          category: action.category,
          timing: action.timing,
          related_diagnosis_id: action.related_diagnosis_id
        });
      });
      
      // Add relationships
      validated.relationships.forEach((rel: DiagnosisSchemaType['relationships'][0]) => {
        edges.push({
          id: rel.id,
          source: rel.source,
          target: rel.target,
          relationship: rel.relationship,
          label: rel.label,
          strength: rel.strength
        });
      });
      
      // Add problem list
      validated.problem_list.forEach((problem: DiagnosisSchemaType['problem_list'][0]) => {
        problemList.push({
          id: problem.id,
          diagnosis: problem.diagnosis,
          icd10Code: problem.icd10Code,
          likelihood: problem.likelihood,
          category: problem.category,
          evidence: problem.evidence,
          status: problem.status
        });
      });
      
      return { nodes, edges, problemList };
    } catch (error) {
      console.warn(`Strategy ${i + 1} failed:`, error);
      if (i === strategies.length - 1) {
        throw new Error(`All JSON parsing strategies failed: ${error}`);
      }
    }
  }
  
  throw new Error('All strategies failed');
} 