import { useState } from "react";
import { useAuth } from "../contextes/auth-context";
import axios from "axios";
import { Spinner } from 'react-bootstrap';

const useFileUpload = (uploadUrl, handleCloseModal) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [resultMsg, setResultMsg] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const maxFileSize = 10 * 1024 * 1024; // 10 MB

    if (file) {
      if (file.size >= maxFileSize) {
        setResultMsg(
          <h5 className="text-danger fs-6 mt-2 mb-2">
            Filesize too big. Size has to be smaller than: 10MB
          </h5>
        );
        handleCloseModal();
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setResultMsg(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("user", JSON.stringify(user));

    try {
      setResultMsg(
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

      if (response.status === 200) {
        setResultMsg(
          <h5 className="text-success fs-6 mt-2 mb-2">
            File uploaded successfully
          </h5>
        );
        return { success: true, message: 'File uploaded successfully', metadata: response.data.metadata };
      } else {
        setResultMsg(
          <h5 className="text-danger fs-6 mt-2 mb-2">
            File upload failed: {response.data.message || response.statusText}
          </h5>
        );
        return { success: false, message: response.data.message || response.statusText, metadata: null };
      }

    } catch (error) {
      setResultMsg(
        <h5 className="text-danger fs-6 mt-2 mb-2">
          Error uploading file: {error.response?.data?.message || error.message}
        </h5>
      );
      return { success: false, message: error.response?.data?.message || error.message, metadata: null };
    } finally {
      handleCloseModal();
    }
  };

  return {
    handleFileChange,
    handleUpload,
    resultMsg,
  };
};

export default useFileUpload;
