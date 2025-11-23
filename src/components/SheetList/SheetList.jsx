import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useAppStore } from '../../store/useAppStore';

export default function SheetList({ onViewSheet }) {
  const { sheets, deleteSheet } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState(null);

  // Filter sheets based on search query
  const filteredSheets = useMemo(() => {
    if (!searchQuery.trim()) return sheets;
    
    const query = searchQuery.toLowerCase();
    return sheets.filter(sheet => 
      sheet.name.toLowerCase().includes(query)
    );
  }, [sheets, searchQuery]);

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') {
      return <PdfIcon sx={{ fontSize: 40 }} />;
    }
    return <ImageIcon sx={{ fontSize: 40 }} />;
  };

  // Get thumbnail for sheet
  const getThumbnail = (sheet) => {
    if (sheet.fileType.startsWith('image/')) {
      return sheet.fileData;
    }
    // For PDF, we'll show a placeholder for now
    return null;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Handle delete confirmation
  const handleDeleteClick = (sheet) => {
    setSheetToDelete(sheet);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (sheetToDelete) {
      await deleteSheet(sheetToDelete._id);
      setDeleteDialogOpen(false);
      setSheetToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSheetToDelete(null);
  };

  // Render grid view
  const renderGridView = () => (
    <Grid container spacing={3}>
      {filteredSheets.map((sheet) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={sheet._id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Thumbnail or Icon */}
            <Box
              sx={{
                height: 200,
                backgroundColor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {getThumbnail(sheet) ? (
                <CardMedia
                  component="img"
                  image={getThumbnail(sheet)}
                  alt={sheet.name}
                  sx={{ height: '100%', objectFit: 'cover' }}
                />
              ) : (
                getFileIcon(sheet.fileType)
              )}
              
              {/* File type badge */}
              <Chip
                label={sheet.fileType === 'application/pdf' ? 'PDF' : 'Image'}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }}
              />
            </Box>

            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" noWrap>
                {sheet.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {formatDate(sheet.createdAt)}
              </Typography>
              {sheet.annotations && sheet.annotations.length > 0 && (
                <Chip
                  label={`${sheet.annotations.length} annotations`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              )}
            </CardContent>

            <CardActions>
              <Button
                size="small"
                startIcon={<ViewIcon />}
                onClick={() => onViewSheet && onViewSheet(sheet)}
              >
                View
              </Button>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteClick(sheet)}
                sx={{ ml: 'auto' }}
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render list view
  const renderListView = () => (
    <List>
      {filteredSheets.map((sheet) => (
        <Card key={sheet._id} sx={{ mb: 2 }}>
          <ListItem
            secondaryAction={
              <Box>
                <Button
                  startIcon={<ViewIcon />}
                  onClick={() => onViewSheet && onViewSheet(sheet)}
                  sx={{ mr: 1 }}
                >
                  View
                </Button>
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() => handleDeleteClick(sheet)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {getFileIcon(sheet.fileType)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={sheet.name}
              secondary={
                <Box>
                  <Typography variant="body2" component="span">
                    {formatDate(sheet.createdAt)}
                  </Typography>
                  {sheet.annotations && sheet.annotations.length > 0 && (
                    <Chip
                      label={`${sheet.annotations.length} annotations`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
            />
          </ListItem>
        </Card>
      ))}
    </List>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">
          My Sheets ({sheets.length})
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Search */}
          <TextField
            placeholder="Search sheets..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          {/* View Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="grid">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ListViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Empty State */}
      {sheets.length === 0 && (
        <Alert severity="info">
          No sheets uploaded yet. Click "Upload" in the sidebar to add your first sheet!
        </Alert>
      )}

      {/* No Results */}
      {sheets.length > 0 && filteredSheets.length === 0 && (
        <Alert severity="warning">
          No sheets found matching "{searchQuery}"
        </Alert>
      )}

      {/* Sheet List */}
      {filteredSheets.length > 0 && (
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Sheet?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{sheetToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}