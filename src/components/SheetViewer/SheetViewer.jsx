import { useState, useEffect, useRef } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  ButtonGroup,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  FitScreen as FitScreenIcon,
} from '@mui/icons-material';
import pdfjsLib from '../../utils/pdfWorker';

export default function SheetViewer({ sheet, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfDocument, setPdfDocument] = useState(null);
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const isPDF = sheet.fileType === 'application/pdf';

  // Load PDF
  useEffect(() => {
    if (!isPDF) {
      setLoading(false);
      return;
    }

    const loadPDF = async () => {
      try {
        setLoading(true);
        const loadingTask = pdfjsLib.getDocument(sheet.fileData);
        const pdf = await loadingTask.promise;
        setPdfDocument(pdf);
        setTotalPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF');
        setLoading(false);
      }
    };

    loadPDF();

    return () => {
      if (pdfDocument) {
        pdfDocument.destroy();
      }
    };
  }, [sheet.fileData, isPDF]);

  // Render PDF page
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const viewport = page.getViewport({ scale });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Error rendering page:', err);
        setError('Failed to render page');
      }
    };

    renderPage();
  }, [pdfDocument, currentPage, scale]);

  // Zoom controls
  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 3.0));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const handleZoomReset = () => setScale(1.0);

  // Page navigation
  const handlePrevPage = () => setCurrentPage(p => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));

  // Fullscreen
  const handleFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        handleNextPage();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleZoomReset();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'background.default',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Toolbar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
            {sheet.name}
          </Typography>

          {/* Zoom Controls */}
          <ButtonGroup variant="outlined" size="small" sx={{ mr: 2 }}>
            <Button onClick={handleZoomOut} disabled={scale <= 0.5}>
              <ZoomOutIcon />
            </Button>
            <Button onClick={handleZoomReset}>
              {Math.round(scale * 100)}%
            </Button>
            <Button onClick={handleZoomIn} disabled={scale >= 3.0}>
              <ZoomInIcon />
            </Button>
          </ButtonGroup>

          {/* Page Navigation (PDF only) */}
          {isPDF && totalPages > 1 && (
            <ButtonGroup variant="outlined" size="small" sx={{ mr: 2 }}>
              <Button onClick={handlePrevPage} disabled={currentPage === 1}>
                <PrevIcon />
              </Button>
              <Button disabled>
                {currentPage} / {totalPages}
              </Button>
              <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
                <NextIcon />
              </Button>
            </ButtonGroup>
          )}

          {/* Fullscreen */}
          <IconButton color="inherit" onClick={handleFullscreen}>
            <FullscreenIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'grey.900',
          p: 2,
        }}
      >
        {loading && <CircularProgress />}

        {error && (
          <Paper sx={{ p: 3 }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {!loading && !error && isPDF && (
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: '100%',
              height: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          />
        )}

        {!loading && !error && !isPDF && (
          <img
            src={sheet.fileData}
            alt={sheet.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `scale(${scale})`,
              transition: 'transform 0.2s',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          />
        )}
      </Box>

      {/* Keyboard Shortcuts Help */}
      <Paper
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          p: 1,
          bgcolor: 'rgba(0,0,0,0.7)',
          color: 'white',
        }}
        elevation={3}
      >
        <Typography variant="caption" display="block">
          <strong>Shortcuts:</strong> ← → (pages) | +/- (zoom) | 0 (reset) | ESC (close)
        </Typography>
      </Paper>
    </Box>
  );
}