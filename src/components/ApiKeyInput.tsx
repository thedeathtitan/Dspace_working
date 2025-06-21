import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  InputAdornment,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface ApiKeyInputProps {
  onApiKeySet: (key: string) => void;
  hasApiKey: boolean;
  compact?: boolean;
}

export function ApiKeyInput({ onApiKeySet, hasApiKey, compact = false }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
      setApiKey('');
      setShowModal(false);
    }
  };

  const handleRemove = () => {
    onApiKeySet('');
  };

  if (compact) {
    return (
      <>
        {hasApiKey ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: 'success.main', 
              borderRadius: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>✓</Typography>
            </Box>
            <Button
              onClick={handleRemove}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' },
                fontSize: '0.875rem',
                textTransform: 'none'
              }}
            >
              Remove Key
            </Button>
          </Box>
        ) : (
          <Button
            onClick={() => setShowModal(true)}
            variant="outlined"
            startIcon={<Typography sx={{ fontSize: '0.75rem' }}>🔑</Typography>}
            sx={{ 
              px: 1.5, 
              py: 1,
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            Add API Key
          </Button>
        )}

        <Dialog 
          open={showModal} 
          onClose={() => setShowModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">OpenAI API Key</Typography>
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
                  OpenAI API Key
                </Typography>
                <TextField
                  type={isVisible ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setIsVisible(!isVisible)}
                          edge="end"
                        >
                          {isVisible ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowModal(false)} variant="outlined">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              variant="contained"
              disabled={!apiKey.trim()}
            >
              Save Key
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <Paper sx={{ p: 3, boxShadow: 2 }}>
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
          <Typography sx={{ color: 'white', fontSize: '1.125rem' }}>🔑</Typography>
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            OpenAI API Key
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Required for AI-powered analysis
          </Typography>
        </Box>
      </Box>

      {hasApiKey ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert 
            severity="success"
            icon={<Typography sx={{ fontSize: '0.875rem' }}>✓</Typography>}
            sx={{ 
              bgcolor: 'success.main',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white',
                fontSize: '1.5rem'
              }
            }}
          >
            <Typography sx={{ fontWeight: 500 }}>API Key Configured</Typography>
            <Typography variant="body2">Your OpenAI API key is ready for use</Typography>
          </Alert>
          <Button
            onClick={handleRemove}
            variant="outlined"
            fullWidth
            sx={{ py: 1.5 }}
          >
            Remove API Key
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
              Enter your OpenAI API Key
            </Typography>
            <TextField
              type={isVisible ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              fullWidth
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setIsVisible(!isVisible)}
                      edge="end"
                    >
                      {isVisible ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
              Your API key is stored locally and never sent to our servers
            </Typography>
          </Box>
          
          <Button
            type="submit"
            variant="contained"
            disabled={!apiKey.trim()}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Save API Key
          </Button>
          
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Box sx={{ 
                width: 24, 
                height: 24, 
                bgcolor: 'secondary.main', 
                borderRadius: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.25
              }}>
                <Typography sx={{ color: 'white', fontSize: '0.75rem' }}>ℹ️</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  How to get an API key:
                </Typography>
                <Box component="ol" sx={{ color: 'text.secondary', fontSize: '0.75rem', m: 0, pl: 2 }}>
                  <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#007acc', textDecoration: 'underline' }}>OpenAI Platform</a></li>
                  <li>Sign in or create an account</li>
                  <li>Navigate to API Keys section</li>
                  <li>Create a new secret key</li>
                  <li>Copy and paste it here</li>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
    </Paper>
  );
}