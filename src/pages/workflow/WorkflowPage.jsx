/**
 * WorkflowPage.jsx - WORKFLOW HAUPTSEITE - MIT NESTED ROUTES
 * 
 * Diese Komponente dient als Container für Workflow-spezifische Routes.
 * Sie rendert entweder WorkflowList (Index) oder WorkflowDetailsPage (/:id)
 */

import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

export default function WorkflowPage() {
  return (
    <Box 
      sx={{ 
        width: '100%',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      {/* Outlet rendert die verschachtelten Routes */}
      <Outlet />
    </Box>
  );
}