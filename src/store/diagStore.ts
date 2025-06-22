import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DiagnosisState } from '../types';
import { analyzeWithOpenAI, transcribeWithWhisper } from '../utils/openai';

export const useDiagStore = create<DiagnosisState>()(
  persist(
    (set, get) => ({
      note: '',
      graph: { nodes: [], edges: [] },
      problemList: [],
      isLoading: false,
      error: null,
      apiKey: '',
      isRecording: false,
      isTranscribing: false,
      
      setNote: (note: string) => set({ note }),
      
      setGraph: (graph) => set({ graph }),
      
      setProblemList: (problemList) => set({ problemList }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      setError: (error: string | null) => set({ error }),
      
      setApiKey: (apiKey: string) => set({ apiKey }),
      
      setRecording: (recording: boolean) => set({ isRecording: recording }),
      
      setTranscribing: (transcribing: boolean) => set({ isTranscribing: transcribing }),
      
      analyzeNote: async (note: string) => {
        const { setLoading, setError, setGraph, setProblemList, apiKey } = get();
        
        if (!note.trim()) {
          setError('Please enter a clinical note to analyze');
          return;
        }
        
        if (!apiKey.trim()) {
          setError('Please enter your OpenAI API key first');
          return;
        }
        
        try {
          setLoading(true);
          setError(null);
          
          // Use real OpenAI API
          const result = await analyzeWithOpenAI(note, apiKey);
          setGraph(result);
          
          // Set problem list if available
          if (result.problemList) {
            setProblemList(result.problemList);
          }
          
        } catch (error) {
          console.error('Analysis error:', error);
          setError(error instanceof Error ? error.message : 'Failed to analyze note');
        } finally {
          setLoading(false);
        }
      },
      
      transcribeAudio: async (audioBlob: Blob) => {
        const { setTranscribing, setError, apiKey } = get();
        
        if (!apiKey.trim()) {
          setError('Please enter your OpenAI API key first');
          throw new Error('API key required');
        }
        
        try {
          setTranscribing(true);
          setError(null);
          
          const transcription = await transcribeWithWhisper(audioBlob, apiKey);
          return transcription;
          
        } catch (error) {
          console.error('Transcription error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to transcribe audio';
          setError(errorMessage);
          throw error;
        } finally {
          setTranscribing(false);
        }
      }
    }),
    {
      name: 'diagnosis-storage',
      // Only persist the API key, not the sensitive clinical data
      partialize: (state) => ({ apiKey: state.apiKey }),
    }
  )
);