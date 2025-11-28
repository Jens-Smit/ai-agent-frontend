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
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
} from '@mui/material';
import {
  Add,
  Search,
  Delete,
  Visibility,
  MenuBook,
  TrendingUp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { knowledgeService } from '../../api/services/knowledgeService';

function KnowledgeBase() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLimit, setSearchLimit] = useState(5);
  const [minScore, setMinScore] = useState(0.3);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    content: '',
    tags: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadKnowledgeBase();
    loadStats();
  }, []);

  const loadKnowledgeBase = async () => {
    try {
      setIsLoading(true);
      const response = await knowledgeService.listKnowledge();
      setDocuments(response.documents);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Knowledge Base');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await knowledgeService.getKnowledgeStats();
      setStats(response.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    
    try {
      setIsSearching(true);
      const response = await knowledgeService.searchKnowledge(
        searchQuery,
        searchLimit,
        minScore
      );
      setSearchResults(response.results);
    } catch (err) {
      setError('Fehler bei der Suche');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreate = async () => {
    if (!newDocument.title || !newDocument.content) {
      setError('Titel und Inhalt sind erforderlich');
      return;
    }
    
    try {
      setIsCreating(true);
      const tags = newDocument.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      
      await knowledgeService.createKnowledge(
        newDocument.title,
        newDocument.content,
        tags.length > 0 ? tags : null
      );
      
      setCreateDialogOpen(false);
      setNewDocument({ title: '', content: '', tags: '' });
      loadKnowledgeBase();
      loadStats();
    } catch (err) {
      setError('Fehler beim Erstellen');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Dokument wirklich löschen?')) return;
    
    try {
      await knowledgeService.deleteKnowledge(docId);
      loadKnowledgeBase();
      loadStats();
    } catch (err) {
      setError('Fehler beim Löschen');
      console.error(err);
    }
  };

  const displayDocuments = searchResults || documents;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <MenuBook sx={{ fontSize: 40, color: 'info.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Knowledge Base
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ihre persönliche Wissensdatenbank
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Neu erstellen
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {stats && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TrendingUp color="primary" />
            <Typography variant="h6">Statistiken</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Gesamt Dokumente
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {stats.total_documents}
              </Typography>
            </Grid>
            {Object.entries(stats.by_source_type || {}).map(([type, count]) => (
              <Grid item xs={6} sm={3} key={type}>
                <Typography variant="body2" color="text.secondary">
                  {type}
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {count}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Semantische Suche
        </Typography>
        <TextField
          fullWidth
          placeholder="Durchsuchen Sie Ihre Knowledge Base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: (
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <CircularProgress size={20} /> : 'Suchen'}
              </Button>
            ),
          }}
        />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" gutterBottom>
              Max. Ergebnisse: {searchLimit}
            </Typography>
            <Slider
              value={searchLimit}
              onChange={(e, val) => setSearchLimit(val)}
              min={1}
              max={20}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" gutterBottom>
              Min. Relevanz: {(minScore * 100).toFixed(0)}%
            </Typography>
            <Slider
              value={minScore}
              onChange={(e, val) => setMinScore(val)}
              min={0}
              max={1}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={(val) => `${(val * 100).toFixed(0)}%`}
            />
          </Grid>
        </Grid>
        
        {searchResults && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {searchResults.length} Ergebnisse gefunden
            <Button
              size="small"
              onClick={() => {
                setSearchResults(null);
                setSearchQuery('');
              }}
              sx={{ ml: 2 }}
            >
              Zurücksetzen
            </Button>
          </Alert>
        )}
      </Paper>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : displayDocuments.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <MenuBook sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Dokumente vorhanden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Erstellen Sie Ihr erstes Wissensdokument
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {displayDocuments.map((doc, index) => {
            const item = searchResults ? doc.document : doc;
            const score = searchResults ? doc.score : null;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
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
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="h6" noWrap>
                          {item.title}
                        </Typography>
                        {score !== null && (
                          <Chip
                            label={`${(score * 100).toFixed(0)}%`}
                            size="small"
                            color="primary"
                          />
                        )}
                      </Box>
                      
                      <Chip
                        label={item.source_type}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                      
                      {item.tags && item.tags.length > 0 && (
                        <Box display="flex" gap={0.5} flexWrap="wrap" mt={1}>
                          {item.tags.slice(0, 3).map((tag, i) => (
                            <Chip key={i} label={tag} size="small" />
                          ))}
                        </Box>
                      )}
                      
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    
                    <CardActions>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/knowledge/${item.id}`)}
                        title="Ansehen"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(item.id)}
                        title="Löschen"
                      >
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog
        open={createDialogOpen}
        onClose={() => !isCreating && setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Neues Wissensdokument</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Titel"
            value={newDocument.title}
            onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Inhalt"
            multiline
            rows={10}
            value={newDocument.content}
            onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Tags (kommagetrennt)"
            value={newDocument.tags}
            onChange={(e) => setNewDocument({ ...newDocument, tags: e.target.value })}
            margin="normal"
            helperText="z.B. wichtig, projekt-x, dokumentation"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={isCreating}>
            Abbrechen
          </Button>
          <Button onClick={handleCreate} variant="contained" disabled={isCreating}>
            {isCreating ? 'Wird erstellt...' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default KnowledgeBase;