import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  Divider,
  Paper,
  IconButton
} from '@mui/material';
import { Close as CloseIcon, MedicalServices as MedicalIcon } from '@mui/icons-material';
import type { ProblemListItem } from '../types';

interface ProblemListProps {
  open: boolean;
  onClose: () => void;
  problemList: ProblemListItem[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'error';
    case 'resolved':
      return 'success';
    case 'ruled-out':
      return 'default';
    default:
      return 'primary';
  }
};

const getLikelihoodColor = (likelihood: number) => {
  if (likelihood >= 0.8) return 'error';
  if (likelihood >= 0.6) return 'warning';
  if (likelihood >= 0.4) return 'info';
  return 'default';
};

export const ProblemList: React.FC<ProblemListProps> = ({ open, onClose, problemList }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <MedicalIcon color="primary" />
        <Typography variant="h6" component="span">
          Problem List
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {problemList.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No problem list available. Please analyze a clinical note first.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {problemList.map((problem, index) => (
              <React.Fragment key={problem.id}>
                <ListItem sx={{ 
                  flexDirection: 'column', 
                  alignItems: 'stretch',
                  p: 2
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    mb: 1,
                    gap: 1
                  }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" sx={{ mb: 0.5 }}>
                        {problem.diagnosis}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        ICD-10: {problem.icd10Code}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${Math.round(problem.likelihood * 100)}%`}
                        color={getLikelihoodColor(problem.likelihood) as any}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={problem.status}
                        color={getStatusColor(problem.status) as any}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Chip
                      label={problem.category}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                  </Box>

                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                      Clinical Evidence:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {problem.evidence.map((evidence, idx) => (
                        <Typography
                          key={idx}
                          component="li"
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {evidence}
                        </Typography>
                      ))}
                    </Box>
                  </Paper>
                </ListItem>
                {index < problemList.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 