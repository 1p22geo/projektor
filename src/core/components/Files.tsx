import React, { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { CloudUpload as CloudUploadIcon, GetApp as GetAppIcon } from '@mui/icons-material';
import axiosInstance from '@core/api';
import useSWR from 'swr';
import { fetcher } from '@core/hooks/useApi';

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

  const { data: files, error: fetchError, isLoading: filesLoading, mutate } = useSWR<FileData[]>(teamId ? `/api/teams/${teamId}/files` : null, fetcher);

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

    try {
      await axiosInstance.post(`/api/teams/${teamId}/files`, formData, {
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

  const handleFileDownload = (fileId: string, filename: string) => {
    // This will trigger a download from the backend
    window.open(`/api/files/${fileId}`, '_blank');
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
      {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}
      {uploadSuccess && <Alert severity="success" sx={{ mb: 2 }}>{uploadSuccess}</Alert>}

      {filesLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      {fetchError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load files: {fetchError.message}
        </Alert>
      )}
      {!filesLoading && !fetchError && files && files.length === 0 && (
        <Typography variant="body2" color="text.secondary">No files uploaded yet.</Typography>
      )}
      {files && files.length > 0 && (
        <List>
          {files.map((file) => (
            <ListItem 
              key={file.id} 
              secondaryAction={
                <IconButton edge="end" aria-label="download" onClick={() => handleFileDownload(file.id, file.filename)}>
                  <GetAppIcon />
                </IconButton>
              }
            >
              <ListItemText primary={file.filename} secondary={`${(file.size / 1024).toFixed(2)} KB - ${new Date(file.created_at).toLocaleDateString()}`} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Files;
