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
    teamId ? `/student/teams/${teamId}/files` : null, 
    (url) => apiClient.get(url).then(res => res.data),
    { refreshInterval: 3000 } // Poll every 3 seconds
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setUploadError(null);
      setUploadSuccess(null);
      
      // Auto-upload the file
      await uploadFile(file);
      
      // Reset input
      event.target.value = '';
    } else {
      setSelectedFile(null);
    }
  };

  const uploadFile = async (file: File) => {
    if (!file || !teamId) {
      setUploadError('Please select a file to upload.');
      return;
    }

    // Check file type
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.zip'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      setUploadError('File type not supported');
      return;
    }

    // Check file size (100MB limit)
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      setUploadError('File exceeds 100MB limit');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiClient.post(`/student/teams/${teamId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadSuccess('File uploaded successfully');
      setSelectedFile(null);
      mutate(); // Revalidate the file list
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      await uploadFile(selectedFile);
    }
  };

  const handleFileDownload = (url: string, filename: string) => {
    // Download using the file URL from backend
    const fullUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}${url}`;
    window.open(fullUrl, '_blank');
  };

  const totalStorage = files?.reduce((total, file) => total + file.size, 0) || 0;
  const storageMB = (totalStorage / (1024 * 1024)).toFixed(2);

  const handleFileDelete = async (fileId: string, filename: string) => {
    setUploadError('File deletion not yet implemented');
  };

  return (
    <Box sx={{ mt: 4 }} role="tabpanel">
      <Typography variant="h6" gutterBottom>
        Team Files
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" data-testid="storage-usage">
          Storage used: {storageMB} MB / 100 MB
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <input
          type="file"
          onChange={handleFileChange}
          id="file-upload-input"
        />
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
      <List data-testid="file-list">
        {!filesLoading && !fetchError && files && files.length === 0 && (
          <Typography variant="body2" color="text.secondary">No files uploaded yet.</Typography>
        )}
        {files && files.length > 0 && files.map((file) => (
          <ListItem 
            key={file.id} 
            secondaryAction={
              <Box>
                <IconButton 
                  edge="end" 
                  aria-label="download" 
                  onClick={() => handleFileDownload(file.url, file.filename)}
                  data-testid={`download-${file.filename}`}
                >
                  <GetAppIcon />
                </IconButton>
                <IconButton 
                  edge="end" 
                  aria-label="delete" 
                  onClick={() => handleFileDelete(file.id, file.filename)}
                  data-testid={`delete-${file.filename}`}
                >
                  ×
                </IconButton>
              </Box>
            }
          >
            <ListItemText 
              primary={
                <Typography data-testid="file-name">{file.filename}</Typography>
              }
              secondary={
                <Box>
                  <Typography variant="caption" data-testid="file-size">
                    {(file.size / 1024).toFixed(2)} KB
                  </Typography>
                  {' • '}
                  <Typography variant="caption" data-testid="file-uploader">
                    {file.user_name}
                  </Typography>
                  {' • '}
                  <Typography variant="caption" data-testid="file-date">
                    {new Date(file.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Files;
