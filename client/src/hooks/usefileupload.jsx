import { useState } from 'react';

const useFileUpload = (uploadUrl, handleCloseModal) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadError(null);
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
      } else {
        console.error('File upload failed:', response.statusText);
        setUploadError('Fehler beim Hochladen der Datei');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Ein Fehler ist beim Hochladen aufgetreten');
    } finally {
      setUploading(false);
      handleCloseModal();
    }
  };

  return { selectedFile, handleFileChange, handleUpload, uploading, uploadError };
};

export default useFileUpload;
