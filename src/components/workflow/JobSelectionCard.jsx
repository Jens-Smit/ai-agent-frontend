// src/components/workflow/JobSelectionCard.jsx

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { AltRoute, Check, Send } from '@mui/icons-material';
import { motion } from 'framer-motion';

/**
 * Komponente zur Auswahl eines Jobs für einen wartenden Decision-Step.
 *
 * @param {Array<Object>} availableJobs - Liste der Job-Objekte, z.B. [{ name: 'Job 1', description: 'Beschreibung...' }]
 * @param {function} onSelect - Callback-Funktion, die mit dem ausgewählten Job-Namen aufgerufen wird.
 * @param {string} stepDescription - Die Beschreibung des Decision-Steps.
 * @param {boolean} isLoading - Globaler Ladezustand des Stores (optional, für visuelles Feedback).
 */
export default function JobSelectionCard({
  availableJobs = [],
  onSelect,
  stepDescription,
  isLoading: isGlobalLoading = false,
}) {
  const [selectedJobrefnr, setSelectedJobrefnr] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Kombinierter Ladezustand für visuelles Feedback
  const loading = isGlobalLoading || isSelecting;

  const handleSelect = async (refnr) => {
    console.log('Job Selection Initiated for refnr:', refnr);

    if (isGlobalLoading) return;

    setSelectedJobrefnr(refnr);
    setIsSelecting(true);

    try {
      // Aufruf des übergebenen Callbacks (der die Store-Aktion ausführt)
      await onSelect(refnr);
      console.log('Job Selection Successful');
      // setIsSelecting wird nach dem Neuladen des Workflows im Store (durch onSelect) implizit zurückgesetzt
    } catch (e) {
      console.error('Job Selection Failed:', e);
      setIsSelecting(false); // Fehlerfall: Ladezustand zurücksetzen
      setSelectedJobrefnr(null);
    }
  };
 console.log('JobSelectionCard Rendered with availableJobs:', availableJobs);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: 3,
          boxShadow: 6,
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <AltRoute color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Entscheidung ausstehend
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 2, fontSize: '0.875rem' }}>
            wir haben {availableJobs.length} passendes Job-Angebote gefunden. 
          </Alert>

          

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Bitte wählen deinen bevorzugten Job aus:
          </Typography>

          {/* Job-Auswahl-Buttons */}
          <Box display="flex" flexDirection="column" gap={1.5}>
          
            {availableJobs.length > 0 ? (
              availableJobs.map((job, index) => (
                 <Button
                    key={`${job.title}-${index}`}
                    variant={selectedJobrefnr === job.refnr ? 'contained' : 'outlined'}
                    color="primary"
                    fullWidth
                    size="large"
                    onClick={() => handleSelect(job.refnr)}
                    disabled={loading}
                    startIcon={
                      loading && selectedJobrefnr === job.refnr ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <Check />
                      )
                    }
                    sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1.5 }}
                  >
                    <Box>
                      <Typography variant="button" display="block" fontWeight="bold">
                        {job.titel}
                      </Typography>
                      <Typography variant="button" display="block" fontWeight="light" color="text.secondary">
                        {job.arbeitgeber} - {job.arbeitsort.ort}
                      </Typography>
                      
                      
                    </Box>
                  </Button>
              ))
            ) : (
              <Alert severity="warning">Keine Optionen verfügbar.</Alert>
            )}
          </Box>

        </CardContent>
      </Card>
    </motion.div>
  );
}