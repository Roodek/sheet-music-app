import { useEffect, useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme, CircularProgress, Box } from '@mui/material';
import AppLayout from './components/Layout/AppLayout';
import UploadPage from './pages/UploadPage';
import SheetsPage from './pages/SheetsPage';
import { useAppStore } from './store/useAppStore';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  const [currentView, setCurrentView] = useState('sheets');
  const { initialize, loading } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render different pages based on currentView
  const renderPage = () => {
    switch (currentView) {
      case 'sheets':
        return <SheetsPage />;
      case 'upload':
        return <UploadPage />;
      case 'playlists':
        return <div>Playlists Page (Coming Soon)</div>;
      default:
        return <SheetsPage />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout onNavigate={setCurrentView}>
        {renderPage()}
      </AppLayout>
    </ThemeProvider>
  );
}

export default App;