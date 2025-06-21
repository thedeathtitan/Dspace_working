import React, { useState } from 'react';
import { useDiagStore } from '../store/diagStore';
import { ApiKeyInput } from './ApiKeyInput';

export function NoteInput() {
  const { note, setNote, analyzeNote, isLoading, error, apiKey, setApiKey } = useDiagStore();
  const [localNote, setLocalNote] = useState(note);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNote(localNote);
    await analyzeNote(localNote);
  };

  const sampleNote = `67-year-old male presents to ED with 3-day history of progressive dyspnea and bilateral lower extremity swelling. Patient reports orthopnea and paroxysmal nocturnal dyspnea. Past medical history significant for hypertension and diabetes mellitus type 2. 

Physical Examination:
- Vital Signs: BP 160/90, HR 110 bpm, RR 22, O2 sat 88% on room air, Temp 98.6°F
- General: Appears uncomfortable, sitting upright
- Cardiovascular: S3 gallop present, elevated JVP to 12 cm
- Pulmonary: Bilateral basilar crackles extending to mid-lung fields
- Extremities: 2+ pitting edema bilateral lower extremities to knees
- No chest pain reported`;

  const loadSampleNote = () => {
    setLocalNote(sampleNote);
    setNote(sampleNote);
  };

  return (
    <div className="space-y-6">
      {/* API Key Input */}
      <div className="bg-surface rounded-2xl p-6 shadow-elevation hover:shadow-elevation-hover transform hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
        <ApiKeyInput 
          onApiKeySet={setApiKey} 
          hasApiKey={!!apiKey} 
        />
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label 
            htmlFor="clinical-note" 
            className="block text-title-3 font-medium text-text-primary mb-3 flex items-center gap-2"
          >
            <span className="text-lg">📝</span>
            Clinical Presentation
          </label>
          <div className="relative">
            <textarea
              id="clinical-note"
              value={localNote}
              onChange={(e) => setLocalNote(e.target.value)}
              placeholder="Describe the patient's presentation, history, physical exam findings, vital signs, and any relevant clinical context..."
              className="w-full h-32 p-4 bg-surface border-0 border-b border-separator focus:border-accent focus:outline-none resize-none text-body text-text-primary placeholder-text-secondary transition-apple duration-apple"
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-surface/90 backdrop-blur-sm rounded flex items-center justify-center">
                <div className="flex items-center gap-3 text-text-primary">
                  <div className="animate-spin h-5 w-5 border-2 border-action border-t-transparent rounded-full"></div>
                  <span className="font-medium text-body">AI analyzing clinical data...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <button
            type="submit"
            disabled={isLoading || !localNote.trim() || !apiKey}
            className="px-6 py-3 bg-diagnosis text-surface rounded-xl hover:bg-diagnosis/90 disabled:bg-text-secondary/50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-elevation hover:shadow-elevation-hover transform hover:-translate-y-0.5 transition-all duration-300"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span className="text-body">Generating Workflow...</span>
              </>
            ) : (
              <>
                <span className="text-base">🧠</span>
                <span className="text-body">Generate AI Analysis</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={loadSampleNote}
            disabled={isLoading}
            className="px-4 py-3 bg-surface text-text-primary rounded-xl shadow-subtle hover:shadow-elevation transform hover:-translate-y-0.5 disabled:bg-separator disabled:cursor-not-allowed font-medium transition-all duration-300"
          >
            <span className="text-body">💼 Load Sample Case</span>
          </button>

          {localNote && (
            <button
              type="button"
              onClick={() => setLocalNote('')}
              disabled={isLoading}
              className="px-4 py-3 bg-surface text-text-secondary rounded-xl shadow-subtle hover:text-text-primary hover:shadow-elevation transform hover:-translate-y-0.5 disabled:bg-separator disabled:cursor-not-allowed font-medium transition-all duration-300"
            >
              <span className="text-body">🗑️ Clear</span>
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-surface rounded-xl shadow-elevation">
            <div className="flex items-center gap-2">
              <span className="text-action text-base">⚠️</span>
              <p className="text-text-primary font-medium text-body">{error}</p>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}