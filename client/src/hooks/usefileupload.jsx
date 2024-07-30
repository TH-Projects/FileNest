import { useState } from "react";
import { useAuth } from "../contextes/auth-context";

// Helper function to format file size
const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = Math.ceil(bytes / Math.pow(k, i));
  return size + " " + sizes[i];
};


const useFileUpload = (uploadUrl, handleCloseModal) => {
  const { user } = useAuth();
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
    formData.append("file", selectedFile);

    try {
      setUploading(true);
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("File uploaded successfully:", data);
        alert("Datei erfolgreich hochgeladen");

        // Set file metadata only after successful upload
        const fileName = selectedFile.name;
        const lastDotIndex = fileName.lastIndexOf(".");

        console.log(selectedFile);
        const metadata = {
          name: lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName, // Name without extension
          extension: lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1) : "", // Extension or empty if none
          size: formatBytes(selectedFile.size),
          lastModified: new Date(selectedFile.lastModified).toISOString(), // ISO-8601 Format
          owner: user.username || null,
        };

        setUploadError(null);
        return metadata; // Return metadata to be handled in the component
      } else {
        console.error("File upload failed:", response.statusText);
        setUploadError("Fehler beim Hochladen der Datei");
        return null;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError("Ein Fehler ist beim Hochladen aufgetreten");
      return null;
    } finally {
      setUploading(false);
      handleCloseModal();
    }
  };

  return {
    selectedFile,
    handleFileChange,
    handleUpload,
    uploading,
    uploadError,
  };
};

export default useFileUpload;
