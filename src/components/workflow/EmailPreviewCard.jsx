/**
 * EmailPreviewCard.jsx - E-MAIL VORSCHAU & VERSAND - VOLLSTÄNDIG ÜBERARBEITET
 * 
 * FEATURES:
 * - Vollständige E-Mail-Vorschau
 * - Attachment-Verwaltung
 * - Vollständiger Body-Dialog
 * - Send/Reject Actions
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  ExpandMore,
  Send,
  Cancel,
  AttachFile,
  Download,
  Email,
  Visibility
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { workflowService } from '../../api/services/workflowService';

export default function EmailPreviewCard({ stepId, emailDetails, onSend, onReject, isLoading }) {
  const [expanded, setExpanded] = useState(true);
  const [fullBodyOpen, setFullBodyOpen] = useState(false);
  const [fullBody, setFullBody] = useState('');
  const [loadingBody, setLoadingBody] = useState(false);
  const [loadingAttachment, setLoadingAttachment] = useState(null);
  const [error, setError] = useState(null);
  console.log(stepId)
  console.log(emailDetails)
  /**
   * Handler: Vollständigen E-Mail Body laden
   */
  const handleViewFullBody = async () => {
    setLoadingBody(true);
    setError(null);
    
    try {
     
      setFullBody(emailDetails.body );
      setFullBodyOpen(true);
    } catch (error) {
      console.error('Failed to load full email body:', error);
      setError('Fehler beim Laden der vollständigen E-Mail');
    } finally {
      setLoadingBody(false);
    }
  };

  /**
   * Handler: Attachment herunterladen
   */
  const handleDownloadAttachment = async (attachmentId) => {
    setLoadingAttachment(attachmentId);
    setError(null);

    try {
      const blob = await workflowService.downloadAttachment(stepId, attachmentId);
      const attachment = emailDetails?.attachments?.find(a => a.id === attachmentId);

      if (!attachment) {
        throw new Error('Attachment nicht gefunden');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename ?? 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download attachment:', error);
      setError('Fehler beim Herunterladen des Anhangs');
    } finally {
      setLoadingAttachment(null);
    }
  };

  /**
   * Handler: Attachment Vorschau
   */
  const handlePreviewAttachment = async (attachmentId) => {
    try {
      const blob = await workflowService.previewAttachment(stepId, attachmentId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to preview attachment:', error);
      setError('Vorschau nicht verfügbar');
    }
  };
  
  // Guard: Email Details noch nicht geladen
  if (!emailDetails) {
    return (
      <Card variant="outlined" sx={{ mt: 2, mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              E-Mail Daten werden geladen...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  console.log('EmailPreviewCard emailDetails:', emailDetails);
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          variant="outlined"
          sx={{
            mt: 2,
            mb: 2,
            borderColor: 'warning.main',
            borderWidth: 2,
            boxShadow: '0 4px 20px rgba(255, 152, 0, 0.15)',
            background: theme => theme.palette.mode === 'dark'
              ? 'linear-gradient(145deg, #2D3748 0%, #1A202C 100%)'
              : 'linear-gradient(145deg, #FFF9E6 0%, #FFFFFF 100%)'
          }}
        >
          <CardContent>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Email color="warning" />
                <Typography variant="h6" fontWeight="bold">
                  E-Mail Vorschau
                </Typography>
                <Chip 
                  label="Bestätigung erforderlich" 
                  color="warning" 
                  size="small" 
                  variant="filled"
                />
              </Box>

              <IconButton
                onClick={() => setExpanded(!expanded)}
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
              >
                <ExpandMore />
              </IconButton>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Collapse in={expanded}>
              <Box>
                {/* Empfänger */}
                <Box mb={2}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    EMPFÄNGER
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {emailDetails?.recipient ?? 'Empfänger unbekannt'}
                  </Typography>
                </Box>

                {/* Betreff */}
                <Box mb={2}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    BETREFF
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {emailDetails?.subject ?? 'Kein Betreff'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Nachricht Vorschau */}
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      NACHRICHT
                    </Typography>
                    {emailDetails?.body_length && (
                      <Typography variant="caption" color="text.secondary">
                        {emailDetails.body_length} Zeichen
                      </Typography>
                    )}
                  </Box>
                  
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      maxHeight: 200,
                      overflow: 'auto',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {emailDetails?.body_preview || emailDetails?.body || 'Keine Nachricht verfügbar'}
                    </Typography>
                  </Paper>

                  {/* Button für vollständige Nachricht */}
                  
                    <Button
                      size="small"
                      startIcon={loadingBody ? <CircularProgress size={16} /> : <Visibility />}
                      onClick={handleViewFullBody}
                      disabled={loadingBody}
                      sx={{ mt: 1 }}
                    >
                      {loadingBody ? 'Lade...' : 'Vollständige Nachricht anzeigen'}
                    </Button>
                 
                </Box>

                {/* Anhänge */}
                {emailDetails?.attachments?.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      ANHÄNGE ({emailDetails?.attachment_count ?? emailDetails?.attachments?.length})
                    </Typography>
                    <List dense>
                      {emailDetails.attachments.map((attachment) => (
                        <ListItem
                          key={attachment.id}
                          sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            mb: 0.5,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                          secondaryAction={
                            <Box display="flex" gap={0.5}>
                              <IconButton
                                edge="end"
                                onClick={() => handlePreviewAttachment(attachment.id)}
                                size="small"
                                title="Vorschau"
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                              <IconButton
                                edge="end"
                                onClick={() => handleDownloadAttachment(attachment.id)}
                                size="small"
                                disabled={loadingAttachment === attachment.id}
                                title="Herunterladen"
                              >
                                {loadingAttachment === attachment.id ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <Download fontSize="small" />
                                )}
                              </IconButton>
                            </Box>
                          }
                        >
                          <ListItemIcon>
                            <AttachFile />
                          </ListItemIcon>
                          <ListItemText
                            primary={attachment.filename ?? 'Unbenannt'}
                            secondary={attachment.size_human ?? ''}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Action Buttons */}
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                    onClick={onSend}
                    disabled={isLoading}
                    fullWidth
                    sx={{ py: 1.5, fontWeight: 'bold' }}
                  >
                    {isLoading ? 'Sende...' : 'E-Mail senden'}
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={onReject}
                    disabled={isLoading}
                    fullWidth
                    sx={{ py: 1.5 }}
                  >
                    Ablehnen
                  </Button>
                </Box>

                {/* User Context Warnung */}
                {emailDetails?.needs_user_context && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Hinweis:</strong> Um diese E-Mail zu versenden, muss Ihr E-Mail-Account verbunden sein.
                    </Typography>
                  </Alert>
                )}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog: Vollständige Nachricht */}
      <Dialog
        open={fullBodyOpen}
        onClose={() => setFullBodyOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Email color="primary" />
            <Typography variant="h6">Vollständige E-Mail Nachricht</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              maxHeight: 500,
              overflow: 'auto'
            }}
          >
            <Typography 
              variant="body2" 
              component="pre"
              sx={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'inherit',
                margin: 0
              }}
            >
              {fullBody}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setFullBodyOpen(false)} variant="contained">
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}