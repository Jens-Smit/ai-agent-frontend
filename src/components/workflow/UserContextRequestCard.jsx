import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Avatar,
  CircularProgress 
} from '@mui/material';
import { LockOpen, Security } from '@mui/icons-material';
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
          maxWidth: 600, 
          border: '2px solid', 
          borderColor: 'secondary.main',
          background: 'linear-gradient(45deg, #f3e5f5 30%, #fff 90%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
              <Security />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" color="secondary.main" fontWeight="bold">
                Zugriff erforderlich
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Der Agent benötigt Ihre Berechtigung, um auf persönliche Daten zuzugreifen.
              </Typography>
            </Box>
          </Box>
          
          <Button 
            variant="contained" 
            color="secondary" 
            fullWidth 
            size="large"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LockOpen />}
            onClick={onConnect}
            disabled={isLoading}
            sx={{ 
              py: 1.5,
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Verbinde...' : 'Verbinden & Fortfahren'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}