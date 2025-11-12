import React, { useState } from 'react';
import { View, Text, Button as RNButton, FlatList, StyleSheet, Platform } from 'react-native';
import apiClient from '@core/api/apiClient';

interface FilesProps {
  teamId: string;
}

interface TeamFile {
  _id: string;
  filename: string;
  url: string;
  size: number;
  user: {
    userId: string;
    name: string;
  };
  createdAt: string;
}

const Files: React.FC<FilesProps> = ({ teamId }) => {
  const [files, setFiles] = useState<TeamFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Placeholder for fetching files (will use SWR later)
  React.useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await apiClient.get(`/teams/${teamId}/files`);
        setFiles(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch files');
      }
    };
    fetchFiles();
  }, [teamId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError(null);
    try {
      const response = await apiClient.post(`/teams/${teamId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFiles((prevFiles) => [...prevFiles, response.data]);
      setUploading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'File upload failed');
      setUploading(false);
    }
  };

  const renderFile = ({ item }: { item: TeamFile }) => (
    <View style={styles.fileItem}>
      <Text style={styles.fileName}>{item.filename}</Text>
      <Text style={styles.fileDetails}>Size: {(item.size / 1024).toFixed(2)} KB</Text>
      <Text style={styles.fileDetails}>Uploaded by: {item.user.name}</Text>
      <RNButton title="Download" onPress={() => window.open(item.url, '_blank')} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Team Files</Text>
      <FlatList
        data={files}
        renderItem={renderFile}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.uploadContainer}>
        {Platform.OS === 'web' ? (
          <input type="file" onChange={handleFileUpload} disabled={uploading} />
        ) : (
          <RNButton title={uploading ? 'Uploading...' : 'Upload File'} onPress={() => console.log('Mobile upload not implemented')} disabled={uploading} />
        )}
        {uploading && <Text>Uploading...</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 10,
  },
  fileItem: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  fileName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  fileDetails: {
    fontSize: 12,
    color: '#666',
  },
  uploadContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
});

export default Files;
