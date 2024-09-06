import { useState } from "react";
import axios from "axios";
import { Spinner } from 'react-bootstrap';
import { createResultMessage } from '../utils/utils';
import { useAuth } from '../contextes/auth-context'; // Importieren Sie den AuthContext

const useFileUpload = (uploadUrl, handleCloseModal) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [resultMsg, setResultMsg] = useState(null);
  const { token } = useAuth(); // Holen Sie sich den Token aus dem AuthContext

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const maxFileSize = 10 * 1024 * 1024; // 10 MB

    if (file) {
      if (file.size >= maxFileSize) {
        setResultMsg(createResultMessage(false, 'File size exceeds the maximum limit of 10 MB'));
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
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        setResultMsg(createResultMessage(true, 'File uploaded successfully'));
        return { success: true, message: 'File uploaded successfully', metadata: response.data.metadata };
      } else {
        setResultMsg(createResultMessage(false, response.data.message || response.statusText));
        return { success: false, message: response.data.message || response.statusText, metadata: null };
      }

    } catch (error) {
      setResultMsg(createResultMessage(false, error.response?.data?.message || error.message));
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
