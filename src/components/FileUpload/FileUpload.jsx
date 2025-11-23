import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { useAppStore } from '../../store/useAppStore';

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function FileUpload() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Add ref for file input
  const fileInputRef = useRef(null);
  
  const { addSheet } = useAppStore();

  // Validate file
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Invalid file type. Only PDF, PNG, and JPG are allowed.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File too large. Maximum size is 10MB.`;
    }
    return null;
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Reset file input
  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file selection
  const handleFileSelect = async (files) => {
    setError(null);
    setSuccess(null);
    
    const fileArray = Array.from(files);
    const errors = [];
    const validFiles = [];
    const newPreviews = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
      } else {
        validFiles.push(file);
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
          const preview = await fileToBase64(file);
          newPreviews.push({ name: file.name, preview, type: 'image' });
        } else {
          newPreviews.push({ name: file.name, preview: null, type: 'pdf' });
        }
      }
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    setSelectedFiles(validFiles);
    setPreviews(newPreviews);
    
    // Reset input so same file can be selected again
    resetFileInput();
  };

  // Handle input change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Remove file from selection
  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
    setError(null);
    // Reset input after removing files
    resetFileInput();
  };

  // Upload files
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      for (const file of selectedFiles) {
        const fileData = await fileToBase64(file);
        
        await addSheet({
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          fileType: file.type,
          fileData: fileData,
        });
      }

      setSuccess(`Successfully uploaded ${selectedFiles.length} file(s)!`);
      setSelectedFiles([]);
      setPreviews([]);
      
      // Reset input after successful upload
      resetFileInput();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Upload Sheet Music
      </Typography>

      {/* Drag and Drop Area */}
      <Card
        sx={{
          mb: 3,
          border: dragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
          backgroundColor: dragActive ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
          transition: 'all 0.3s',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Drag and drop files here
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            or
          </Typography>

          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
            sx={{ mt: 2 }}
          >
            Browse Files
            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleInputChange}
            />
          </Button>

          <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
            Supported formats: PDF, PNG, JPG (Max 10MB per file)
          </Typography>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} icon={<SuccessIcon />}>
          {success}
        </Alert>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Selected Files ({selectedFiles.length})
            </Typography>

            <List>
              {selectedFiles.map((file, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={file.name}
                    secondary={`${file.type} - ${(file.size / 1024).toFixed(2)} KB`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveFile(index)}
                      disabled={uploading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            {/* Upload Progress */}
            {uploading && <LinearProgress sx={{ mt: 2 }} />}

            {/* Upload Button */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleUpload}
              disabled={uploading}
              sx={{ mt: 2 }}
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Preview Section */}
      {previews.length > 0 && previews.some(p => p.preview) && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {previews.map((preview, index) => (
                preview.preview && (
                  <Box key={index} sx={{ width: 150, textAlign: 'center' }}>
                    <img
                      src={preview.preview}
                      alt={preview.name}
                      style={{
                        width: '100%',
                        height: 150,
                        objectFit: 'cover',
                        borderRadius: 8,
                      }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {preview.name}
                    </Typography>
                  </Box>
                )
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}