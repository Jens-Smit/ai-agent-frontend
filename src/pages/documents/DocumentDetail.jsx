import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  MenuItem ,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Edit,
  Delete,
  Save,
  Cancel,
  Description,
} from '@mui/icons-material';
import ListIcon from '@mui/icons-material/List';
import { motion } from 'framer-motion';
import { documentService } from '../../api/services/documentService';

function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    display_name: '',
    description: '',
    category: '',
    tags: [],
  });
  const [indexDialogOpen, setIndexDialogOpen] = useState(false);
  const [indexTags, setIndexTags] = useState('');
  const [indexing, setIndexing] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      setIsLoading(true);
      const response = await documentService.getDocument(id);
      setDocument(response.document);
      setEditData({
        display_name: response.document.name || '',
        description: response.document.description || '',
        category: response.document.category || '',
        tags: response.document.tags || [],
      });
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden des Dokuments');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await documentService.downloadDocument(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.original_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Fehler beim Download');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Dokument wirklich löschen?')) return;
    
    try {
      await documentService.deleteDocument(id);
      navigate('/documents');
    } catch (err) {
      setError('Fehler beim Löschen');
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      const response = await documentService.updateDocument(id, {
        display_name: editData.display_name,
        description: editData.description,
        category: editData.category,
        tags: editData.tags,
      });
      setDocument(response.document);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Fehler beim Speichern');
      console.error(err);
    }
  };

  const handleIndex = async () => {
    try {
      setIndexing(true);
      const tags = indexTags.split(',').map(t => t.trim()).filter(Boolean);
      await documentService.indexDocument(id, tags.length > 0 ? tags : null);
      setIndexDialogOpen(false);
      setIndexTags('');
      loadDocument();
    } catch (err) {
      setError('Fehler beim Indizieren');
      console.error(err);
    } finally {
      setIndexing(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!document) {
    return (
      <Box>
        <Alert severity="error">Dokument nicht gefunden</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/documents')} sx={{ mt: 2 }}>
          Zurück
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/documents')}>
            <ArrowBack />
          </IconButton>
          <Description sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              {document.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {document.original_filename}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            startIcon={<Download />}
            onClick={handleDownload}
            variant="outlined"
          >
            Download
          </Button>
          {!isEditing && (
            <Button
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
              variant="outlined"
            >
              Bearbeiten
            </Button>
          )}
          <Button
            startIcon={<Delete />}
            onClick={handleDelete}
            variant="outlined"
            color="error"
          >
            Löschen
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Details
              </Typography>
              
              <Divider sx={{ mb: 3 }} />

              {isEditing ? (
                <Box>
                  <TextField
                    fullWidth
                    label="Anzeigename"
                    value={editData.display_name}
                    onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                    margin="normal"
                  />

                  <TextField
                    fullWidth
                    label="Beschreibung"
                    multiline
                    rows={4}
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    margin="normal"
                  />

                  <TextField
                    fullWidth
                    label="Tags (Komma-separiert)"
                    value={editData.tags}
                    onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                    margin="normal"
                  />

                  <TextField
                    select
                    fullWidth
                    label="Kategorie"
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    margin="normal"
                  >
                    <MenuItem value="template">Template</MenuItem>
                    <MenuItem value="attachment">Attachment</MenuItem>
                    <MenuItem value="reference">Reference</MenuItem>
                    <MenuItem value="media">Media</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>

                  <Box display="flex" gap={2} mt={3}>
                    <Button startIcon={<Save />} onClick={handleSave} variant="contained">
                      Speichern
                    </Button>
                    <Button startIcon={<Cancel />} onClick={() => setIsEditing(false)} variant="outlined">
                      Abbrechen
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Beschreibung:
                    </Typography>
                    <Typography variant="body1">
                      {document.description || 'Keine Beschreibung'}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Kategorie:
                    </Typography>
                    <Chip label={document.category} size="small" sx={{ mt: 0.5 }} />
                  </Box>
                  
                  {document.tags && document.tags.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Tags:
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {document.tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Metadaten
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Typ:
                </Typography>
                <Typography variant="body1">{document.type}</Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  MIME Type:
                </Typography>
                <Typography variant="body1">{document.mime_type}</Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Größe:
                </Typography>
                <Typography variant="body1">{document.size}</Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Erstellt:
                </Typography>
                <Typography variant="body1">
                  {new Date(document.created_at).toLocaleString()}
                </Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Zugriffe:
                </Typography>
                <Typography variant="body1">{document.access_count || 0}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Button
                fullWidth
                startIcon={<ListIcon />}
                onClick={() => setIndexDialogOpen(true)}
                variant="outlined"
                color="primary"
              >
                In Knowledge Base indizieren
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={indexDialogOpen}
        onClose={() => !indexing && setIndexDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Dokument indizieren</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Das Dokument wird in die Knowledge Base indiziert und kann dann durchsucht werden.
          </Typography>
          <TextField
            fullWidth
            label="Tags (optional, kommagetrennt)"
            value={indexTags}
            onChange={(e) => setIndexTags(e.target.value)}
            margin="normal"
            helperText="z.B. wichtig, vertraulich, projekt-x"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIndexDialogOpen(false)} disabled={indexing}>
            Abbrechen
          </Button>
          <Button onClick={handleIndex} variant="contained" disabled={indexing}>
            {indexing ? 'Wird indiziert...' : 'Indizieren'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DocumentDetail;