/**
 * UserContextRequestCard.jsx - USER CONTEXT INJECTION CARD
 * 
 * Fordert den Benutzer auf, seinen Account zu verbinden
 * für Operationen, die User-Context benötigen.
 */

import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Avatar,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  LockOpen, 
  Security, 
  VpnKey,
  Email,
  CheckCircle
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function UserContextRequestCard({ onConnect, isLoading }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          border: '2px solid', 
          borderColor: 'secondary.main',
          background: theme => theme.palette.mode === 'dark'
            ? 'linear-gradient(145deg, #4A5568 0%, #2D3748 100%)'
            : 'linear-gradient(145deg, #EDF2F7 0%, #E2E8F0 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar 
              sx={{ 
                bgcolor: 'secondary.main', 
                width: 56, 
                height: 56 
              }}
            >
              <Security fontSize="large" />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" color="secondary.main" fontWeight="bold" gutterBottom>
                Authentifizierung erforderlich
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Der Agent benötigt Zugriff auf Ihre persönlichen Daten, um diese Aktion durchzuführen.
              </Typography>
            </Box>
          </Box>

          {/* Info Box */}
          <Alert severity="info" sx={{ mb: 3 }} icon={<VpnKey />}>
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              Was wird verbunden?
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="E-Mail Account für Versand" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Benutzer-Credentials (verschlüsselt)" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Alert>

          {/* Action Button */}
          <Button 
            variant="contained" 
            color="secondary" 
            fullWidth 
            size="large"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LockOpen />}
            onClick={()=>{
              console.log('UserContextRequestCard Button geklickt!'); 
              onConnect();
           }}
            disabled={isLoading}
            sx={{ 
              py: 1.5,
              fontWeight: 'bold',
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6
              }
            }}
          >
            {isLoading ? 'Verbinde...' : 'Jetzt verbinden & fortfahren'}
          </Button>

          {/* Security Note */}
          <Box mt={2} p={2} bgcolor="background.default" borderRadius={1}>
            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={1}>
              <Security fontSize="small" />
              Ihre Daten werden verschlüsselt übertragen und sicher gespeichert.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}