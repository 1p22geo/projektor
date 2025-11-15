import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import Button from './Button';

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

  const handleFileUpload = async () => {
    console.log('File upload not implemented on native yet');
  };

  const handleDownload = (file: FileItem) => {
    console.log('Downloading file:', file.filename);
  };

  return (
    <View style={styles.container}>
      <Button onPress={handleFileUpload}>Upload File</Button>

      {files.length === 0 ? (
        <Text style={styles.emptyText}>
          No files uploaded yet.
        </Text>
      ) : (
        <ScrollView style={styles.fileList}>
          {files.map((file) => (
            <Card key={file._id} style={styles.fileCard}>
              <Card.Content style={styles.fileContent}>
                <View style={styles.fileInfo}>
                  <Text variant="bodyLarge">{file.filename}</Text>
                  <Text variant="bodySmall" style={styles.fileSize}>
                    {(file.size / 1024).toFixed(2)} KB
                  </Text>
                </View>
                <IconButton
                  icon="download"
                  onPress={() => handleDownload(file)}
                />
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 32,
  },
  fileList: {
    marginTop: 16,
  },
  fileCard: {
    marginBottom: 8,
  },
  fileContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileSize: {
    color: '#666',
    marginTop: 4,
  },
});

export default Files;
