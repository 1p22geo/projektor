import React, { useState, useEffect } from 'react';
import apiClient from '@core/api/apiClient';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton
} from '@mui/material';
import { CloudUpload as UploadIcon, GetApp as DownloadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Button from '@platform/components/Button';

interface FilesProps {
  teamId: string;
}

interface FileItem {
  _id: string;
  filename: string;
  size: number;
  url: string;
  user: {
    user_id: string;
    name: string;
  };
  created_at: string;
}

const Files: React.FC<FilesProps> = ({ teamId }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totalSize, setTotalSize] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [teamId]);

  const loadFiles = async () => {
    try {
      const response = await apiClient.get(`/teams/${teamId}/files`);
      const fileList = response.data.files || [];
      setFiles(fileList);
      const total = fileList.reduce((sum: number, file: FileItem) => sum + file.size, 0);
      setTotalSize(total);
    } catch (err: any) {
      console.error('Failed to load files:', err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['.pdf', '.docx', '.png', '.jpg', '.jpeg'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      setError('File type not supported. Allowed types: PDF, DOCX, PNG, JPG');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      await apiClient.post(`/teams/${teamId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('File uploaded successfully');
      await loadFiles();
      event.target.value = ''; // Reset input
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await apiClient.get(file.url, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError('Failed to download file');
    }
  };

  const handleDelete = async (fileId: string) => {
    // For now, deletion is not implemented in backend
    // This would require a DELETE endpoint
    setDeleteConfirm(null);
    setError('File deletion not yet implemented');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return timestamp;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Files</Typography>
        <Typography variant="body2" color="text.secondary" data-testid="storage-usage">
          {formatSize(totalSize)} / 100 MB
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} role="alert" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} role="alert" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <input
          accept=".pdf,.docx,.png,.jpg,.jpeg"
          style={{ display: 'none' }}
          id="file-upload"
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <label htmlFor="file-upload">
          <Button component="span" disabled={uploading} startIcon={<UploadIcon />}>
            Upload
          </Button>
        </label>
        {uploading && <LinearProgress sx={{ mt: 1 }} />}
      </Box>

      <Box data-testid="file-list">
        {files.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No files uploaded yet.
          </Typography>
        ) : (
          <List>
            {files.map((file) => (
              <ListItem
                key={file._id}
                secondaryAction={
                  <Box>
                    <IconButton 
                      edge="end" 
                      onClick={() => handleDownload(file)}
                      data-testid={`download-${file.filename}`}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      onClick={() => setDeleteConfirm(file._id)}
                      data-testid={`delete-${file.filename}`}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={<Typography data-testid="file-name">{file.filename}</Typography>}
                  secondary={
                    <Box component="span">
                      <Typography component="span" variant="caption" data-testid="file-size">
                        {formatSize(file.size)}
                      </Typography>
                      {' • '}
                      <Typography component="span" variant="caption" data-testid="file-uploader">
                        {file.user.name}
                      </Typography>
                      {' • '}
                      <Typography component="span" variant="caption" data-testid="file-date">
                        {formatDate(file.created_at)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this file?
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setDeleteConfirm(null)}>Cancel</MuiButton>
          <MuiButton onClick={() => deleteConfirm && handleDelete(deleteConfirm)} color="error">
            Confirm
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Files;
