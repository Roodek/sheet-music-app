import { useEffect, useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme, CircularProgress, Box } from '@mui/material';
import AppLayout from './components/Layout/AppLayout';
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout onNavigate={setCurrentView}>
        <h1>Current View: {currentView}</h1>
        <p>Ready to build features!</p>
      </AppLayout>
    </ThemeProvider>
  );
}

export default App;