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
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Save,
  Cancel,
  MenuBook,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { knowledgeService } from '../../api/services/knowledgeService';

function KnowledgeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    content: '',
    tags: '',
  });

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      setIsLoading(true);
      const response = await knowledgeService.getKnowledge(id);
      setDocument(response.document);
      setEditData({
        title: response.document.title || '',
        content: response.document.content || '',
        tags: response.document.tags?.join(', ') || '',
      });
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden des Dokuments');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Dokument wirklich löschen?')) return;
    
    try {
      await knowledgeService.deleteKnowledge(id);
      navigate('/knowledge');
    } catch (err) {
      setError('Fehler beim Löschen');
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      const tags = editData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      
      const response = await knowledgeService.updateKnowledge(id, {
        title: editData.title,
        content: editData.content,
        tags: tags.length > 0 ? tags : null,
      });
      
      setDocument(response.document);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Fehler beim Speichern');
      console.error(err);
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
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/knowledge')} sx={{ mt: 2 }}>
          Zurück
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/knowledge')}>
            <ArrowBack />
          </IconButton>
          <MenuBook sx={{ fontSize: 40, color: 'info.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              {document.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {document.source_type} • {new Date(document.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" gap={1}>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Paper sx={{ p: 4 }}>
          {isEditing ? (
            <Box>
              <TextField
                fullWidth
                label="Titel"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Inhalt"
                multiline
                rows={15}
                value={editData.content}
                onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Tags (kommagetrennt)"
                value={editData.tags}
                onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                margin="normal"
              />
              
              <Box display="flex" gap={2} mt={3}>
                <Button
                  startIcon={<Save />}
                  onClick={handleSave}
                  variant="contained"
                >
                  Speichern
                </Button>
                <Button
                  startIcon={<Cancel />}
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      title: document.title || '',
                      content: document.content || '',
                      tags: document.tags?.join(', ') || '',
                    });
                  }}
                  variant="outlined"
                >
                  Abbrechen
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              {document.tags && document.tags.length > 0 && (
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tags:
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {document.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" color="primary" />
                    ))}
                  </Box>
                </Box>
              )}
              
              <Divider sx={{ mb: 3 }} />
              
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                  fontSize: '1rem',
                }}
              >
                {document.content}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Erstellt: {new Date(document.created_at).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aktualisiert: {new Date(document.updated_at).toLocaleString()}
                </Typography>
              </Box>
              
              {document.source_reference && (
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Quelle: {document.source_reference}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
}

export default KnowledgeDetail;