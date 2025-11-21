import React, { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { CloudUpload as CloudUploadIcon, GetApp as GetAppIcon } from '@mui/icons-material';
import apiClient from '@core/api/apiClient';
import useSWR from 'swr';

interface FileData {
  id: string;
  user_id: string;
  user_name: string;
  filename: string;
  url: string;
  size: number;
  created_at: string;
}

interface FilesProps {
  teamId: string;
}

const Files: React.FC<FilesProps> = ({ teamId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const { data: files, error: fetchError, isLoading: filesLoading, mutate } = useSWR<FileData[]>(
    teamId ? `/teams/${teamId}/files` : null, 
    (url) => apiClient.get(url).then(res => res.data),
    { refreshInterval: 3000 } // Poll every 3 seconds
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null);
      setUploadSuccess(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !teamId) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    formData.append('user_id', user.id || '');
    formData.append('user_name', user.email || user.name || 'Anonymous');

    try {
      await apiClient.post(`/teams/${teamId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadSuccess('File uploaded successfully!');
      setSelectedFile(null);
      mutate(); // Revalidate the file list
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDownload = (url: string, filename: string) => {
    // Download using the file URL from backend
    const fullUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}${url}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Team Files
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <input
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload-button"
        />
        <label htmlFor="file-upload-button">
          <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />}>
            {selectedFile ? selectedFile.name : 'Choose File'}
          </Button>
        </label>
        <Button
          variant="contained"
          onClick={handleFileUpload}
          disabled={!selectedFile || uploading}
          startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </Box>
      {uploadError && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{uploadError}</Alert>}
      {uploadSuccess && <Alert severity="success" role="alert" sx={{ mb: 2 }}>{uploadSuccess}</Alert>}

      {filesLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      {fetchError && (
        <Alert severity="error" role="alert" sx={{ mt: 2 }}>
          Failed to load files: {fetchError.message}
        </Alert>
      )}
      {!filesLoading && !fetchError && files && files.length === 0 && (
        <Typography variant="body2" color="text.secondary">No files uploaded yet.</Typography>
      )}
      {files && files.length > 0 && (
        <List data-testid="file-list">
          {files.map((file) => (
            <ListItem 
              key={file.id} 
              secondaryAction={
                <IconButton edge="end" aria-label="download" onClick={() => handleFileDownload(file.url, file.filename)}>
                  <GetAppIcon />
                </IconButton>
              }
            >
              <ListItemText 
                data-testid="file-name"
                primary={file.filename} 
                secondary={`${(file.size / 1024).toFixed(2)} KB - ${new Date(file.created_at).toLocaleDateString()}`} 
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Files;
