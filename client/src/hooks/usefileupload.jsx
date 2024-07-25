import { useState } from 'react';

// Helper function to format file size
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024; 
  // Application allows sizes until 5MB
  const availSizes = ['Bytes', 'KB', 'MB'];
  const unitID = Math.floor(Math.log(bytes) / Math.log(k));
  const size = Math.ceil(bytes / Math.pow(k, unitID));
  return size + ' ' + availSizes[unitID];
}

const useFileUpload = (uploadUrl, handleCloseModal) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploading(true);
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('File uploaded successfully:', data);
        alert('Datei erfolgreich hochgeladen');

        // Set file metadata only after successful upload
        const metadata = {
          name: selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')), // Name without extension
          extension: selectedFile.name.substring(selectedFile.name.lastIndexOf('.') + 1), // extension
          size: formatBytes(selectedFile.size),
          lastModified: new Date().toISOString(), // ISO-8601 Format
          owner: null,
        };
        
        setUploadError(null);
        return metadata; // Return metadata to be handled in the component
      } else {
        console.error('File upload failed:', response.statusText);
        setUploadError('Fehler beim Hochladen der Datei');
        return null;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Ein Fehler ist beim Hochladen aufgetreten');
      return null;
    } finally {
      setUploading(false);
      handleCloseModal();
    }
  };

  return { selectedFile, handleFileChange, handleUpload, uploading, uploadError };
};

export default useFileUpload;
