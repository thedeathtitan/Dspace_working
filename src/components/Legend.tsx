import { Box, Typography, Paper } from '@mui/material';

export function Legend() {
  const legendItems = [
    {
      icon: '🩺',
      label: 'Primary Diagnosis',
      color: 'primary.main'
    },
    {
      icon: '🤔',
      label: 'Differential Diagnosis',
      color: 'secondary.main'
    },
    {
      icon: '🚨',
      label: 'Urgent Action',
      color: 'error.main'
    },
    {
      icon: '⚡',
      label: 'High Priority Action',
      color: 'warning.main'
    },
    {
      icon: '📋',
      label: 'Standard Action',
      color: 'success.main'
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Main Legend Card */}
      <Paper sx={{ 
        borderRadius: 3, 
        p: 3, 
        boxShadow: 2,
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-4px)',
        },
        transition: 'all 0.3s ease',
        bgcolor: 'background.paper'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{ 
            width: 24, 
            height: 24, 
            bgcolor: 'warning.main', 
            borderRadius: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            <Typography sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>🧾</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Clinical Workflow Guide
          </Typography>
        </Box>
        
        {/* Node Types */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          <Typography variant="caption" sx={{ 
            fontWeight: 500, 
            color: 'text.secondary', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1 
          }}>
            <Box sx={{ width: 8, height: 8, bgcolor: 'warning.main', borderRadius: '50%' }} />
            Node Classifications
          </Typography>
          {legendItems.map((item, index) => (
            <Box key={index} sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: 'background.default', 
              boxShadow: 1,
              '&:hover': {
                boxShadow: 2,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease'
            }}>
              <Box sx={{ 
                bgcolor: item.color, 
                color: 'white', 
                borderRadius: 1, 
                p: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <Typography sx={{ fontSize: '0.875rem' }}>{item.icon}</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}