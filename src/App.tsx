import { Box, Typography, Paper, IconButton, Chip } from '@mui/material';
import { NoteInput } from './components/NoteInput';
import { GraphBoard } from './components/GraphBoard';

function App() {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Header - Dark mode with Cursor-inspired design */}
      <Paper 
        component="header" 
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          boxShadow: 2, 
          position: 'sticky', 
          top: 0, 
          zIndex: 50,
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ maxWidth: '100%', mx: 'auto', px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative' }}>
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
                  <Typography sx={{ color: 'white', fontSize: '1.125rem' }}>🧠</Typography>
                </Box>
                <Box sx={{ 
                  position: 'absolute', 
                  top: -4, 
                  right: -4, 
                  width: 12, 
                  height: 12, 
                  bgcolor: 'success.main', 
                  borderRadius: '50%', 
                  border: 2, 
                  borderColor: 'background.paper'
                }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Diagnosis-Space
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Clinical Reasoning Platform
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              <Chip 
                icon={<Box sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }} />}
                label="AI Ready"
                sx={{ 
                  bgcolor: 'success.main',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Main Content Area */}
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {/* Input Section */}
        <Box sx={{ bgcolor: 'background.default' }}>
          <Box sx={{ maxWidth: '7xl', mx: 'auto', px: 2, py: 3 }}>
            <Box>
              <NoteInput />
            </Box>
          </Box>
        </Box>

        {/* Graph Visualization */}
        <Box sx={{ flex: 1, position: 'relative', minHeight: 0, bgcolor: 'background.default' }}>
          <Box sx={{ position: 'absolute', inset: 0 }}>
            <GraphBoard />
          </Box>
          
          {/* Floating Performance Indicator - Solid dark panel */}
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
            <Paper sx={{ px: 2, py: 1.5, boxShadow: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    bgcolor: 'primary.main', 
                    borderRadius: '50%'
                  }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Live Analysis
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Floating Action Buttons */}
          <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <IconButton 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  bgcolor: 'primary.main',
                  boxShadow: 4,
                  '&:hover': {
                    boxShadow: 5,
                    transform: 'scale(1.1)',
                  }
                }}
              >
                <Typography sx={{ color: 'white', fontSize: '1.125rem' }}>🎯</Typography>
              </IconButton>
              <IconButton 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  bgcolor: 'success.main',
                  boxShadow: 4,
                  '&:hover': {
                    boxShadow: 5,
                    transform: 'scale(1.1)',
                  }
                }}
              >
                <Typography sx={{ color: 'white', fontSize: '1.125rem' }}>📊</Typography>
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Tiny footer strip */}
      <Paper 
        component="footer" 
        sx={{ 
          borderTop: 1, 
          borderColor: 'divider', 
          color: 'text.secondary', 
          textAlign: 'center', 
          py: 0.5,
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="caption">
          ⚠️ Research & Education Only
        </Typography>
      </Paper>
    </Box>
  );
}

export default App;