import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Upload,
  Search,
  Download,
  Delete,
  Visibility,
  Description,
  Save,
  Cancel,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { documentService } from '../../api/services/documentService';

function Documents() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadOptions, setUploadOptions] = useState({
    category: 'other',
    display_name: '',
    description: '',
    tags: '',
    index_to_knowledge: false,
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await documentService.listDocuments();
      setDocuments(response.documents);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Dokumente');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadDocuments();
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await documentService.searchDocuments(searchTerm);
      setDocuments(response.documents);
    } catch (err) {
      setError('Fehler bei der Suche');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    
    try {
      setIsUploading(true);
      await documentService.uploadDocument(uploadFile, uploadOptions);
      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadOptions({
        category: 'other',
        display_name: '',
        description: '',
        tags: '',
        index_to_knowledge: false,
      });
      loadDocuments();
    } catch (err) {
      setError('Fehler beim Hochladen');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Dokument wirklich löschen?')) return;
    
    try {
      await documentService.deleteDocument(docId);
      loadDocuments();
    } catch (err) {
      setError('Fehler beim Löschen');
      console.error(err);
    }
  };

  const handleDownload = async (docId, filename) => {
    try {
      const blob = await documentService.downloadDocument(docId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Fehler beim Download');
      console.error(err);
    }
  };

  const filteredDocuments = documents;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Dokumente
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Hochladen
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Dokumente durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: (
              <Button onClick={handleSearch}>Suchen</Button>
            ),
          }}
        />
      </Paper>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : filteredDocuments.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Description sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Dokumente vorhanden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Laden Sie Ihr erstes Dokument hoch
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredDocuments.map((doc, index) => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="start" gap={2} mb={2}>
                      <Description color="primary" sx={{ fontSize: 40 }} />
                      <Box flexGrow={1}>
                        <Typography variant="h6" noWrap gutterBottom>
                          {doc.name}
                        </Typography>
                        <Chip
                          label={doc.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Typ: {doc.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Größe: {doc.size}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Erstellt: {new Date(doc.created_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      title="Ansehen"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(doc.id, doc.original_filename)}
                      title="Herunterladen"
                    >
                      <Download />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(doc.id)}
                      title="Löschen"
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={uploadDialogOpen}
        onClose={() => !isUploading && setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Dokument hochladen</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files[0])}
              style={{ marginBottom: 16 }}
            />

            <TextField
              fullWidth
              label="Anzeigename"
              value={uploadOptions.display_name}
              onChange={(e) =>
                setUploadOptions({ ...uploadOptions, display_name: e.target.value })
              }
              margin="normal"
            />

            <TextField
              fullWidth
              label="Beschreibung"
              multiline
              rows={3}
              value={uploadOptions.description}
              onChange={(e) =>
                setUploadOptions({ ...uploadOptions, description: e.target.value })
              }
              margin="normal"
            />

            <TextField
              fullWidth
              label="Tags (Komma-separiert)"
              value={uploadOptions.tags}
              onChange={(e) =>
                setUploadOptions({ ...uploadOptions, tags: e.target.value })
              }
              margin="normal"
            />

            <TextField
              select
              fullWidth
              label="Kategorie"
              value={uploadOptions.category}
              onChange={(e) =>
                setUploadOptions({ ...uploadOptions, category: e.target.value })
              }
              margin="normal"
            >
              <MenuItem value="template">Template</MenuItem>
              <MenuItem value="attachment">Attachment</MenuItem>
              <MenuItem value="reference">Reference</MenuItem>
              <MenuItem value="media">Media</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            <Box display="flex" gap={2} mt={3}>
              <Button
                startIcon={<Save />}
                onClick={handleUpload}
                variant="contained"
              >
                Hochladen
              </Button>
              <Button
                startIcon={<Cancel />}
                onClick={() => setUploadOptions({})}
                variant="outlined"
              >
                Abbrechen
              </Button>
            </Box>
          </Box>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={isUploading}>
            Abbrechen
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!uploadFile || isUploading}
          >
            {isUploading ? 'Wird hochgeladen...' : 'Hochladen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Documents;