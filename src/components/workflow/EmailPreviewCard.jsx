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
  Alert
} from '@mui/material';
import {
  ExpandMore,
  Send,
  Cancel,
  AttachFile,
  Download,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { workflowService } from '../../api/services/workflowService';

function EmailPreviewCard({ stepId, emailDetails, onSend, onReject, isLoading }) {
  const [expanded, setExpanded] = useState(true);
  const [fullBodyOpen, setFullBodyOpen] = useState(false);
  const [fullBody, setFullBody] = useState('');
  const [loadingBody, setLoadingBody] = useState(false);
  const [error, setError] = useState(null);

  const handleViewFullBody = async () => {
    setLoadingBody(true);
    setError(null);
    try {
      const response = await workflowService.getStepEmailBody(stepId);
      setFullBody(response?.body ?? '');
      setFullBodyOpen(true);
    } catch (error) {
      console.error('Failed to load full email body:', error);
      setError('Fehler beim Laden der E-Mail');
    } finally {
      setLoadingBody(false);
    }
  };

  const handleDownloadAttachment = async (attachmentId) => {
    try {
      const blob = await workflowService.downloadAttachment(stepId, attachmentId);
      const attachment = emailDetails?.attachments?.find(a => a.id === attachmentId);

      if (!attachment) return;

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
    }
  };

  // Guard: wenn emailDetails noch nicht da ist
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
            boxShadow: '0 4px 20px rgba(255, 152, 0, 0.15)'
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Send color="warning" />
                <Typography variant="h6" fontWeight="bold">
                  E-Mail Vorschau
                </Typography>
                <Chip label="Bestätigung erforderlich" color="warning" size="small" />
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

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Collapse in={expanded}>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  An:
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {emailDetails?.recipient ?? 'Empfänger unbekannt'}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Betreff:
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {emailDetails?.subject ?? 'Kein Betreff'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Nachricht:
                </Typography>
                <Box
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
                  <Typography variant="body2" whiteSpace="pre-wrap">
                    {emailDetails?.body_preview || emailDetails?.body || 'Keine Nachricht verfügbar'}
                  </Typography>
                </Box>

                {emailDetails?.body_length > (emailDetails?.body_preview?.length ?? 0) && (
                  <Button
                    size="small"
                    onClick={handleViewFullBody}
                    disabled={loadingBody}
                    sx={{ mt: 1 }}
                  >
                    {loadingBody ? 'Lade...' : 'Vollständige Nachricht anzeigen'}
                  </Button>
                )}
              </Box>

              {emailDetails?.attachments?.length > 0 && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Anhänge ({emailDetails?.attachment_count ?? emailDetails?.attachments?.length}):
                  </Typography>
                  <List dense>
                    {emailDetails.attachments.map((attachment) => (
                      <ListItem
                        key={attachment.id}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => handleDownloadAttachment(attachment.id)}
                            size="small"
                          >
                            <Download />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <AttachFile />
                        </ListItemIcon>
                        <ListItemText
                          primary={attachment.filename ?? 'Unbenannt'}
                          secondary={attachment.size_human ?? ''}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

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
            </Collapse>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog
        open={fullBodyOpen}
        onClose={() => setFullBodyOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Vollständige E-Mail Nachricht</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              maxHeight: 500,
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="body2" whiteSpace="pre-wrap">
              {fullBody}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFullBodyOpen(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EmailPreviewCard;