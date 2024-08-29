/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useAuth } from "../contextes/auth-context";
import axios from "axios";
import { Spinner } from 'react-bootstrap';

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
  const [resultMessage, setResultMessage] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const maxFileSize = 10 * 1024 * 1024; // 10 MB

    if (file) {
      // Check if the file size exceeds the limit      
      if (file.size >= maxFileSize) {
        setResultMessage(
          <h5 className="text-danger fs-6 mt-2 mb-2">
            Filesize too big. Size:  {formatBytes(maxFileSize)}
          </h5>
        );
        handleCloseModal();
        setSelectedFile(null);
        return resultMessage;
      }

      // If all checks pass, set the file and clear previous errors
      setSelectedFile(file);
      setResultMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // FormData object to hold the file and user data
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("user", JSON.stringify(user));

    try {      
      // Show a spinner while uploading
      // Gets replaced by the result message
      setResultMessage(
        <div className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Uploading...</span>
          </Spinner>
          <h5 className="text-secondary fs-6 ms-2">Uploading...</h5>
        </div>
      );
      
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const uploadStatus = response.status;
      const uploadStatusText = response.statusText;
      const metadata = response.data.metadata;
      
      if (uploadStatus === 200) {
        await handleCloseModal();
        setResultMessage(
          <h5 className="text-success fs-6 mt-2 mb-2">
            File uploaded successfully
          </h5>
        );
        return {metadata: metadata};
      } else {
        await handleCloseModal();
        setResultMessage(
          <h5 className="text-danger fs-6 mt-2 mb-2">
            File upload failed: {uploadStatusText}
          </h5>
        );
        return {success: false, message: uploadStatusText};
      }

    } catch (error) {
      setResultMessage(
        <h5 className="text-danger fs-6 mt-2 mb-2">
          Error uploading file: {error.message}
        </h5>
      );
      return {success: false, message: error.message};
    } finally {
      handleCloseModal();
    }
  };

  return {
    handleFileChange,
    handleUpload,
    resultMessage,
  };
};

export default useFileUpload;
