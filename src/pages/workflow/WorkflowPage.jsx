import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

/**
 * WorkflowPage ist nur ein Layout-Wrapper
 * Der eigentliche Inhalt kommt über <Outlet /> (React Router)
 */
function WorkflowPage() {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        p: 0
      }}
    >
      {/* Hier wird der Sub-Route Content gerendert */}
      <Outlet />
    </Box>
  );
}

export default WorkflowPage;