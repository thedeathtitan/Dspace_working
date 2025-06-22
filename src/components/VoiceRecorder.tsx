import { useState, useRef } from 'react';
import { Box, IconButton, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { Mic, Stop } from '@mui/icons-material';
import { useDiagStore } from '../store/diagStore';

interface VoiceRecorderProps {
  onTranscription: (transcription: string) => void;
}

export function VoiceRecorder({ onTranscription }: VoiceRecorderProps) {
  const { transcribeAudio, apiKey, setError } = useDiagStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setLocalError(null);
      setError(null);
      
      if (!apiKey.trim()) {
        setLocalError('Please enter your OpenAI API key first');
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        await handleTranscription();
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      const errorMessage = 'Microphone access denied. Please allow microphone permissions.';
      setLocalError(errorMessage);
      setError(errorMessage);
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async () => {
    setIsTranscribing(true);
    setLocalError(null);
    setError(null);

    try {
      if (audioChunksRef.current.length === 0) {
        throw new Error('No audio data recorded');
      }

      // Create audio blob from recorded chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Use the real OpenAI Whisper API
      const transcription = await transcribeAudio(audioBlob);
      
      // Call the callback with the real transcription
      onTranscription(transcription);
      
    } catch (err) {
      const errorMessage = 'Failed to transcribe audio. Please try again.';
      setLocalError(errorMessage);
      setError(errorMessage);
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isTranscribing) {
      startRecording();
    }
  };

  const getButtonColor = () => {
    if (isRecording) return 'error.main';
    if (isTranscribing) return 'primary.main';
    return 'background.paper';
  };

  const getButtonIcon = () => {
    if (isRecording) return <Stop sx={{ color: 'white' }} />;
    if (isTranscribing) return <CircularProgress size={16} sx={{ color: 'white' }} />;
    return <Mic sx={{ fontSize: '1.125rem' }} />;
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <IconButton
        onClick={handleClick}
        disabled={isTranscribing}
        sx={{
          width: 48,
          height: 48,
          bgcolor: getButtonColor(),
          border: isRecording || isTranscribing ? 'none' : 1,
          borderColor: 'divider',
          boxShadow: isRecording || isTranscribing ? 4 : 2,
          '&:hover': {
            boxShadow: isRecording || isTranscribing ? 5 : 3,
            transform: isTranscribing ? 'none' : 'scale(1.05)',
          },
          '&:disabled': {
            cursor: 'not-allowed',
          }
        }}
        title={isRecording ? 'Stop Recording' : isTranscribing ? 'Transcribing...' : 'Start Voice Recording'}
      >
        {getButtonIcon()}
      </IconButton>

      {/* Recording indicator */}
      {isRecording && (
        <Box sx={{ 
          position: 'absolute', 
          top: -8, 
          right: -8, 
          width: 16, 
          height: 16, 
          bgcolor: 'error.main', 
          borderRadius: '50%',
          animation: 'pulse 1s infinite'
        }} />
      )}

      {/* Error message */}
      {error && (
        <Box sx={{ 
          position: 'absolute', 
          top: '100%', 
          mt: 1, 
          right: 0, 
          zIndex: 50, 
          minWidth: 256
        }}>
          <Alert 
            severity="error"
            icon={<Typography sx={{ fontSize: '0.75rem' }}>⚠️</Typography>}
            sx={{ 
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'error.main',
              boxShadow: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Recording Error
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {error}
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Status tooltip */}
      {(isRecording || isTranscribing) && (
        <Box sx={{ 
          position: 'absolute', 
          top: '100%', 
          mt: 1, 
          right: 0, 
          zIndex: 50,
          whiteSpace: 'nowrap'
        }}>
          <Paper sx={{ px: 1.5, py: 1, boxShadow: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%',
                bgcolor: isRecording ? 'error.main' : 'primary.main',
                animation: isRecording ? 'pulse 1s infinite' : 'spin 1s linear infinite'
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {isRecording ? 'Recording...' : 'Transcribing...'}
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}