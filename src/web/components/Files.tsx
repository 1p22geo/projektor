import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, LinearProgress } from '@mui/material';
import { CloudUpload as UploadIcon, GetApp as DownloadIcon } from '@mui/icons-material';
import Button from '@platform/components/Button';

interface FilesProps {
  teamId: string;
}

interface FileItem {
  _id: string;
  filename: string;
  size: number;
  url: string;
}

const Files: React.FC<FilesProps> = ({ teamId }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    console.log('Uploading file:', file.name, 'for team:', teamId);
    
    setTimeout(() => {
      setUploading(false);
    }, 2000);
  };

  const handleDownload = (file: FileItem) => {
    console.log('Downloading file:', file.filename);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <input
          accept="*/*"
          style={{ display: 'none' }}
          id="file-upload"
          type="file"
          onChange={handleFileUpload}
        />
        <label htmlFor="file-upload">
          <Button component="span">
            Upload File
          </Button>
        </label>
        {uploading && <LinearProgress sx={{ mt: 1 }} />}
      </Box>

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
                <IconButton edge="end" onClick={() => handleDownload(file)}>
                  <DownloadIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={file.filename}
                secondary={`${(file.size / 1024).toFixed(2)} KB`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Files;
