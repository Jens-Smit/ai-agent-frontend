// src/pages/DocumentsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Description as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  DataObject as JsonIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  listDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
  updateDocument,
  indexDocument,
  searchDocuments,
  getStorageStats,
} from '../api/documents';
import { getErrorMessage } from '../api/client';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [storageStats, setStorageStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  // Upload Form
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState('other');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadIndexToKnowledge, setUploadIndexToKnowledge] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
    loadStorageStats();
  }, [filterCategory, filterType]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await listDocuments(filterCategory || null, filterType || null, 100);
      setDocuments(data.documents || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadStorageStats = async () => {
    try {
      const data = await getStorageStats();
      setStorageStats(data.storage);
    } catch (err) {
      console.error('Failed to load storage stats:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadDocuments();
      return;
    }

    try {
      setLoading(true);
      const data = await searchDocuments(searchQuery, 50);
      setDocuments(data.documents || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setError('Bitte wählen Sie eine Datei aus');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    if (uploadName) formData.append('display_name', uploadName);
    if (uploadDescription) formData.append('description', uploadDescription);
    if (uploadCategory) formData.append('category', uploadCategory);
    if (uploadTags) formData.append('tags', uploadTags);
    if (uploadIndexToKnowledge) formData.append('index_to_knowledge', 'true');

    try {
      setUploading(true);
      await uploadDocument(formData);
      setSuccess('Dokument erfolgreich hochgeladen!');
      setShowUploadModal(false);
      resetUploadForm();
      loadDocuments();
      loadStorageStats();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const blob = await downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.original_filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Möchten Sie dieses Dokument wirklich löschen?')) return;

    try {
      await deleteDocument(docId);
      setSuccess('Dokument gelöscht');
      loadDocuments();
      loadStorageStats();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleEditSubmit = async () => {
    if (!editingDoc) return;

    try {
      await updateDocument(editingDoc.id, {
        display_name: editingDoc.name,
        description: editingDoc.description,
        category: editingDoc.category,
        tags: editingDoc.tags,
      });
      setSuccess('Dokument aktualisiert');
      setShowEditModal(false);
      setEditingDoc(null);
      loadDocuments();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleIndexToKnowledge = async (docId) => {
    try {
      await indexDocument(docId);
      setSuccess('Dokument wurde zur Knowledge Base hinzugefügt');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadName('');
    setUploadDescription('');
    setUploadCategory('other');
    setUploadTags('');
    setUploadIndexToKnowledge(false);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <PdfIcon />;
      case 'image': return <ImageIcon />;
      case 'text': return <FileIcon />;
      default: return <JsonIcon />;
    }
  };

  const getFileColor = (type) => {
    switch (type) {
      case 'pdf': return 'error';
      case 'image': return 'success';
      case 'text': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Dokumente
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Verwalten Sie Ihre hochgeladenen Dateien
        </Typography>
      </Box>

      {/* Storage Stats */}
      {storageStats && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Speicherplatz</Typography>
              <Chip
                label={`${storageStats.document_count} Dokumente`}
                color="primary"
                variant="outlined"
              />
            </Box>
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {storageStats.used_human} / {storageStats.limit_human}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {Math.round(storageStats.usage_percent * 100)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={storageStats.usage_percent * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Dokumente durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={filterCategory}
                  label="Kategorie"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="">Alle</MenuItem>
                  <MenuItem value="template">Template</MenuItem>
                  <MenuItem value="attachment">Anhang</MenuItem>
                  <MenuItem value="reference">Referenz</MenuItem>
                  <MenuItem value="media">Medien</MenuItem>
                  <MenuItem value="other">Sonstige</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Typ</InputLabel>
                <Select
                  value={filterType}
                  label="Typ"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="">Alle</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="document">Dokument</MenuItem>
                  <MenuItem value="image">Bild</MenuItem>
                  <MenuItem value="text">Text</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setShowUploadModal(true)}
              >
                Upload
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Lade Dokumente...</Typography>
        </Box>
      ) : documents.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h2" sx={{ mb: 2 }}>📄</Typography>
            <Typography variant="h6" gutterBottom>
              Keine Dokumente vorhanden
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Laden Sie Ihr erstes Dokument hoch
            </Typography>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setShowUploadModal(true)}
            >
              Dokument hochladen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          <AnimatePresence>
            {documents.map((doc) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 8,
                      },
                    }}
                  >
                    <CardContent>
                      {/* Icon & Type */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: `${getFileColor(doc.type)}.light`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: `${getFileColor(doc.type)}.main`,
                          }}
                        >
                          {getFileIcon(doc.type)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {doc.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {doc.size}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Tags */}
                      {doc.tags && doc.tags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                          {doc.tags.slice(0, 3).map((tag, i) => (
                            <Chip key={i} label={tag} size="small" variant="outlined" />
                          ))}
                          {doc.tags.length > 3 && (
                            <Chip label={`+${doc.tags.length - 3}`} size="small" variant="outlined" />
                          )}
                        </Box>
                      )}

                      {/* Meta */}
                      <Box sx={{ mb: 2, pb: 2, borderTop: 1, borderColor: 'divider', pt: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Hochgeladen: {new Date(doc.created_at).toLocaleDateString('de-DE')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                          <Chip label={doc.category} size="small" />
                          {doc.is_indexed && (
                            <Chip label="Indiziert" size="small" color="success" />
                          )}
                        </Box>
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleDownload(doc)}
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setEditingDoc(doc);
                            setShowEditModal(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      {/* Upload Modal */}
      <Dialog
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Dokument hochladen</DialogTitle>
        <DialogContent>
          <Button
            fullWidth
            variant="outlined"
            component="label"
            sx={{ mb: 2, mt: 1, py: 3 }}
          >
            {uploadFile ? uploadFile.name : 'Datei auswählen'}
            <input
              type="file"
              hidden
              onChange={(e) => setUploadFile(e.target.files[0])}
            />
          </Button>
          <TextField
            fullWidth
            label="Anzeigename (optional)"
            value={uploadName}
            onChange={(e) => setUploadName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Beschreibung (optional)"
            multiline
            rows={3}
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Kategorie</InputLabel>
            <Select
              value={uploadCategory}
              label="Kategorie"
              onChange={(e) => setUploadCategory(e.target.value)}
            >
              <MenuItem value="template">Template</MenuItem>
              <MenuItem value="attachment">Anhang</MenuItem>
              <MenuItem value="reference">Referenz</MenuItem>
              <MenuItem value="media">Medien</MenuItem>
              <MenuItem value="other">Sonstige</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Tags (Komma-getrennt)"
            value={uploadTags}
            onChange={(e) => setUploadTags(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadModal(false)}>Abbrechen</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!uploadFile || uploading}
          >
            {uploading ? 'Wird hochgeladen...' : 'Hochladen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Dokument bearbeiten</DialogTitle>
        <DialogContent>
          {editingDoc && (
            <>
              <TextField
                fullWidth
                label="Name"
                value={editingDoc.name}
                onChange={(e) => setEditingDoc({ ...editingDoc, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Beschreibung"
                multiline
                rows={3}
                value={editingDoc.description || ''}
                onChange={(e) => setEditingDoc({ ...editingDoc, description: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={editingDoc.category}
                  label="Kategorie"
                  onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value })}
                >
                  <MenuItem value="template">Template</MenuItem>
                  <MenuItem value="attachment">Anhang</MenuItem>
                  <MenuItem value="reference">Referenz</MenuItem>
                  <MenuItem value="media">Medien</MenuItem>
                  <MenuItem value="other">Sonstige</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Abbrechen</Button>
          <Button onClick={handleEditSubmit} variant="contained">
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

export default DocumentsPage;