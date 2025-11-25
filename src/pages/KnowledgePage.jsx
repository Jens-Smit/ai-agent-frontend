// src/pages/KnowledgePage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  LinearProgress,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as StatsIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  listKnowledgeDocuments,
  createKnowledgeDocument,
  updateKnowledgeDocument,
  deleteKnowledgeDocument,
  searchKnowledge,
  getKnowledgeStats,
} from '../api/knowledge';
import { getErrorMessage } from '../api/client';

const KnowledgePage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('');

  useEffect(() => {
    loadDocuments();
    loadStats();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await listKnowledgeDocuments();
      setDocuments(data.documents || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getKnowledgeStats();
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const data = await searchKnowledge(searchQuery, 10, 0.3);
      setSearchResults(data.results || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSearching(false);
    }
  };

  const handleCreate = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      setError('Titel und Inhalt sind erforderlich');
      return;
    }

    try {
      const tags = formTags ? formTags.split(',').map(t => t.trim()) : null;
      await createKnowledgeDocument(formTitle, formContent, tags);
      setSuccess('Wissensdokument erstellt!');
      setShowCreateModal(false);
      resetForm();
      loadDocuments();
      loadStats();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleEdit = async () => {
    if (!editingDoc) return;

    try {
      const tags = formTags ? formTags.split(',').map(t => t.trim()) : null;
      await updateKnowledgeDocument(editingDoc.id, {
        title: formTitle,
        content: formContent,
        tags,
      });
      setSuccess('Dokument aktualisiert!');
      setShowEditModal(false);
      setEditingDoc(null);
      resetForm();
      loadDocuments();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Möchten Sie dieses Dokument wirklich löschen?')) return;

    try {
      await deleteKnowledgeDocument(docId);
      setSuccess('Dokument gelöscht');
      loadDocuments();
      loadStats();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const openEditModal = (doc) => {
    setEditingDoc(doc);
    setFormTitle(doc.title);
    setFormContent(doc.content || '');
    setFormTags(doc.tags?.join(', ') || '');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormTags('');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Wissensdatenbank
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Verwalten Sie Ihre persönliche Knowledge Base
        </Typography>
      </Box>

      {/* Stats Card */}
      {stats && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <StatsIcon sx={{ fontSize: 48 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" fontWeight={700}>
                  {stats.total_documents}
                </Typography>
                <Typography variant="h6">Wissensdokumente</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Nach Quelle:
                </Typography>
                {Object.entries(stats.by_source_type).map(([type, count]) => (
                  <Chip
                    key={type}
                    label={`${type}: ${count}`}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', m: 0.5 }}
                  />
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Search & Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Semantische Suche in der Knowledge Base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
              >
                {searching ? 'Sucht...' : 'Suchen'}
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateModal(true)}
              >
                Neu
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Suchergebnisse ({searchResults.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {searchResults.map((result, i) => (
                <Paper key={i} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {result.document.title}
                    </Typography>
                    <Chip
                      label={`${Math.round(result.score * 100)}% Übereinstimmung`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                  {result.document.tags && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {result.document.tags.map((tag, j) => (
                        <Chip key={j} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Lade Wissensdokumente...</Typography>
        </Box>
      ) : documents.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h2" sx={{ mb: 2 }}>🧠</Typography>
            <Typography variant="h6" gutterBottom>
              Keine Wissensdokumente vorhanden
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Erstellen Sie Ihr erstes Wissensdokument
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateModal(true)}
            >
              Dokument erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box>
          <AnimatePresence>
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" sx={{ flex: 1 }}>
                        {doc.title}
                      </Typography>
                      <Chip label={doc.source_type} size="small" />
                      {doc.tags && doc.tags.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {doc.tags.slice(0, 2).map((tag, i) => (
                            <Chip key={i} label={tag} size="small" variant="outlined" />
                          ))}
                          {doc.tags.length > 2 && (
                            <Chip label={`+${doc.tags.length - 2}`} size="small" variant="outlined" />
                          )}
                        </Box>
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Erstellt: {new Date(doc.created_at).toLocaleString('de-DE')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Aktualisiert: {new Date(doc.updated_at).toLocaleString('de-DE')}
                      </Typography>
                      {doc.source_reference && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Quelle: {doc.source_reference}
                        </Typography>
                      )}
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => openEditModal(doc)}
                        >
                          Bearbeiten
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(doc.id)}
                        >
                          Löschen
                        </Button>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      )}

      {/* Create Modal */}
      <Dialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Neues Wissensdokument</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Titel"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Inhalt"
            multiline
            rows={10}
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Tags (Komma-getrennt)"
            value={formTags}
            onChange={(e) => setFormTags(e.target.value)}
            margin="normal"
            placeholder="z.B. kontakte, arbeit"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateModal(false)}>Abbrechen</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!formTitle.trim() || !formContent.trim()}
          >
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Dokument bearbeiten</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Titel"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Inhalt"
            multiline
            rows={10}
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Tags (Komma-getrennt)"
            value={formTags}
            onChange={(e) => setFormTags(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Abbrechen</Button>
          <Button onClick={handleEdit} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KnowledgePage;