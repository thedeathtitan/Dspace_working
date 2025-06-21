import { useState, useRef, useCallback, useEffect } from 'react';
import { useDiagStore } from '../store/diagStore';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
}

export function VoiceRecorder({ onTranscription }: VoiceRecorderProps) {
  const {
    isRecording,
    isTranscribing,
    setRecording,
    transcribeAudio,
    apiKey
  } = useDiagStore();

  const [error, setError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Maximum recording duration (5 minutes to stay well under Whisper's 25MB limit)
  const MAX_RECORDING_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  const startRecording = useCallback(async () => {
    if (!apiKey) {
      setError('Please enter your OpenAI API key first');
      return;
    }

    try {
      setError(null);
      setRecordingDuration(0);
      
      // Request audio with optimized settings for speech
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Optimal for speech recognition
          channelCount: 1 // Mono for better compression
        }
      });
      
      streamRef.current = stream;
      
      // Try different audio formats in order of preference for Whisper compatibility
      let mimeType = 'audio/webm;codecs=opus';
      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/wav'
      ];
      
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000 // Good quality for speech
      });
      
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();
      
      // Start duration tracking
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setRecordingDuration(elapsed);
        
        // Auto-stop if max duration reached
        if (elapsed >= MAX_RECORDING_DURATION) {
          stopRecording();
        }
      }, 100);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Clear duration tracking
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
        
        // Create audio blob with appropriate type
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Validate audio size (Whisper has 25MB limit)
        if (audioBlob.size > 25 * 1024 * 1024) {
          setError('Recording too large. Please record shorter audio clips.');
          cleanupResources();
          return;
        }
        
        if (audioBlob.size === 0) {
          setError('No audio data recorded. Please try again.');
          cleanupResources();
          return;
        }
        
        try {
          const transcription = await transcribeAudio(audioBlob);
          if (transcription.trim()) {
            onTranscription(transcription);
          } else {
            setError('No speech detected. Please try speaking more clearly.');
          }
        } catch (error) {
          console.error('Transcription failed:', error);
          setError('Failed to transcribe audio. Please try again.');
        }
        
        cleanupResources();
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred. Please try again.');
        cleanupResources();
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second for better streaming
      setRecording(true);
      console.log('Recording started successfully');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone permissions.');
        } else if (error.name === 'NotFoundError') {
          setError('No microphone found. Please check your audio devices.');
        } else {
          setError('Failed to access microphone. Please try again.');
        }
      } else {
        setError('Failed to start recording.');
      }
      cleanupResources();
    }
  }, [apiKey, transcribeAudio, onTranscription, setRecording]);

  const cleanupResources = useCallback(() => {
    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear duration interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    // Reset recording state
    setRecording(false);
    setRecordingDuration(0);
    
    // Clear refs
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  }, [setRecording]);

  const stopRecording = useCallback(() => {
    console.log('stopRecording called, mediaRecorder exists:', !!mediaRecorderRef.current, 'isRecording:', isRecording);
    
    if (mediaRecorderRef.current && isRecording) {
      try {
        console.log('Stopping MediaRecorder...');
        mediaRecorderRef.current.stop();
        console.log('MediaRecorder.stop() called successfully');
      } catch (error) {
        console.error('Error stopping recording:', error);
        cleanupResources();
      }
    } else {
      console.log('Cannot stop recording - conditions not met');
    }
  }, [isRecording, cleanupResources]);

  const toggleRecording = useCallback(() => {
    console.log('Toggle recording clicked, current state:', { isRecording, isTranscribing });
    
    if (isRecording) {
      console.log('Stopping recording...');
      stopRecording();
    } else {
      console.log('Starting recording...');
      startRecording();
    }
  }, [isRecording, isTranscribing, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);

  const isProcessing = isRecording || isTranscribing;
  
  // Format recording duration for display
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate recording progress (0-1 for max duration)
  const recordingProgress = Math.min(recordingDuration / MAX_RECORDING_DURATION, 1);

  return (
    <div className="relative">
      <button
        onClick={toggleRecording}
        disabled={isTranscribing || !apiKey}
        className={`
          w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 transform
          ${isRecording 
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-elevation hover:shadow-elevation-hover hover:-translate-y-0.5' 
            : 'bg-surface text-text-primary shadow-subtle hover:shadow-elevation hover:-translate-y-0.5'
          }
          ${isTranscribing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={isRecording ? 'Click to STOP recording' : 'Start voice recording'}
      >
        {isRecording ? (
          <div className="relative flex items-center justify-center">
            {/* Stop icon - clearly visible square */}
            <div className="w-4 h-4 bg-white rounded-sm"></div>
            {/* Recording progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
              />
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeDasharray={`${2 * Math.PI * 9}`}
                strokeDashoffset={`${2 * Math.PI * 9 * (1 - recordingProgress)}`}
                className="transition-all duration-100"
              />
            </svg>
          </div>
        ) : isTranscribing ? (
          <div className="animate-spin h-4 w-4 border-2 border-text-primary border-t-transparent rounded-full"></div>
        ) : (
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="drop-shadow-sm"
          >
            <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/>
            <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
            <path d="M12 18v4"/>
            <path d="M8 22h8"/>
          </svg>
        )}
      </button>
      
      {error && (
        <div className="absolute top-full left-0 mt-2 z-10 min-w-max">
          <div className="bg-surface rounded-lg p-2 shadow-elevation text-caption text-action">
            {error}
          </div>
        </div>
      )}
      
      {isProcessing && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-10">
          <div className={`backdrop-blur-sm rounded-lg px-3 py-1 shadow-elevation text-caption whitespace-nowrap ${
            isRecording 
              ? 'bg-red-500/90 text-white animate-pulse' 
              : 'bg-surface/90 text-text-primary'
          }`}>
            {isRecording 
              ? `🔴 REC ${formatDuration(recordingDuration)} / ${formatDuration(MAX_RECORDING_DURATION)} - Click to STOP`
              : '🔄 Transcribing...'
            }
          </div>
        </div>
      )}
    </div>
  );
}