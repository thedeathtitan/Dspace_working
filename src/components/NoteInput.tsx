import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useDiagStore } from '../store/diagStore';
import { ApiKeyInput } from './ApiKeyInput';
import { VoiceRecorder } from './VoiceRecorder';

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

  const handleVoiceTranscription = (transcription: string) => {
    const newNote = localNote ? `${localNote}\n\n${transcription}` : transcription;
    setLocalNote(newNote);
    setNote(newNote);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: 'primary.main', 
              borderRadius: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: 4
            }}>
              <Typography sx={{ color: 'white', fontSize: '1.125rem' }}>📝</Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Clinical Presentation
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Describe the patient's case for AI analysis
              </Typography>
            </Box>
          </Box>
          
          {/* Main Input Row */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            {/* Textarea with Voice Button */}
            <Box sx={{ flex: 1, position: 'relative' }}>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Box sx={{ flex: 1, position: 'relative' }}>
                  <TextField
                    id="clinical-note"
                    multiline
                    rows={6}
                    value={localNote}
                    onChange={(e) => setLocalNote(e.target.value)}
                    placeholder="Describe the patient's presentation, history, physical exam findings, vital signs, and any relevant clinical context..."
                    disabled={isLoading}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '15px',
                        lineHeight: '120%',
                        letterSpacing: '-0.2px',
                        '& textarea': {
                          color: 'text.primary',
                          '&::placeholder': {
                            color: 'text.secondary',
                            opacity: 1,
                          },
                        },
                      },
                    }}
                  />
                  {isLoading && (
                    <Box sx={{ 
                      position: 'absolute', 
                      inset: 0, 
                      bgcolor: 'background.paper', 
                      opacity: 0.95,
                      borderRadius: 1,
                      border: 1,
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ position: 'relative', mb: 2 }}>
                          <CircularProgress size={48} sx={{ color: 'primary.main' }} />
                        </Box>
                        <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>
                          AI analyzing clinical data...
                        </Typography>
                        <Box sx={{ mt: 1.5, display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                          <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                          <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
                
                {/* Voice Recorder Button */}
                <Box sx={{ flexShrink: 0, pt: 1 }}>
                  <VoiceRecorder onTranscription={handleVoiceTranscription} />
                </Box>
              </Box>
            </Box>
            
            {/* Compact API Key Input */}
            <Box sx={{ flexShrink: 0, pt: 1 }}>
              <ApiKeyInput 
                onApiKeySet={setApiKey} 
                hasApiKey={!!apiKey}
                compact={true}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !localNote.trim() || !apiKey}
            startIcon={<Typography sx={{ fontSize: '1.125rem' }}>🧠</Typography>}
            sx={{ 
              px: 4, 
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: 'white' }} />
                <span>Generating Workflow...</span>
              </Box>
            ) : (
              "Generate AI Analysis"
            )}
          </Button>

          <Button
            variant="outlined"
            onClick={loadSampleNote}
            disabled={isLoading}
            startIcon={<Typography sx={{ fontSize: '1.125rem' }}>💼</Typography>}
            sx={{ 
              px: 3, 
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            Load Sample Case
          </Button>

          {localNote && (
            <Button
              variant="outlined"
              onClick={() => setLocalNote('')}
              disabled={isLoading}
              startIcon={<Typography sx={{ fontSize: '1.125rem' }}>🗑️</Typography>}
              sx={{ 
                px: 3, 
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                color: 'text.secondary',
                '&:hover': {
                  color: 'text.primary',
                }
              }}
            >
              Clear
            </Button>
          )}
        </Box>

        {error && (
          <Alert 
            severity="error" 
            icon={<Typography sx={{ fontSize: '1.125rem' }}>⚠️</Typography>}
            sx={{ 
              p: 2.5,
              bgcolor: 'error.main',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white',
                fontSize: '2rem'
              }
            }}
          >
            <Typography sx={{ fontWeight: 500 }}>{error}</Typography>
          </Alert>
        )}

      </Box>
    </Box>
  );
}