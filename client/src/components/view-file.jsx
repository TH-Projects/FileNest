/* eslint-disable react/prop-types */
import { Container, Row, Col, Button } from "react-bootstrap";
import { useAuth } from "../contextes/auth-context";
import axios from "axios";
import { saveAs } from 'file-saver';
import { formatTimestamp, formatBytes, createResultMessage } from '../utils/utils';
import "../style/cards.css";

const HOST = import.meta.env.VITE_APP_HOST

const FileView = ({ file_meta_data, onDelete, onDownload }) => {  
  const { token } = useAuth();  
  const { file_id, name, file_type, size, username, last_modify } = file_meta_data;

  // Handle click on download button
  const handleDownload = async () => {
    try {
      // Try to download the requested file
      const response = await axios.get(`http://${HOST}/download`, {
        params: { file_id },
        responseType: 'blob',
      });
      if (onDownload) onDownload(createResultMessage(true, 'File downloaded successfully'));
      saveAs(response.data, `${name}.${file_type}`);
    } catch (error) {
      if (error.response && error.response.data instanceof Blob) {
        // convert blob to text
        error.response.data.text().then(text => {
          try {
            const errorResponse = JSON.parse(text);
            if (onDownload) onDownload(createResultMessage(false, errorResponse.message));
            console.error('ErrorMsg:', errorResponse.message);
          } catch (e) {
            if (onDownload) onDownload(createResultMessage(false, error.response.data));
          }
        });
      }       
      if (onDownload) onDownload(createResultMessage(false, 'Unknown error'));
    }
  };

  // Handle click on delete button
  const handleDelete = async () => {
    // Ask for confirmation before deleting the file
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    if(!file_id || !token) {
      if (onDelete) onDelete(createResultMessage(false, 'Missing required parameters'));
      return;
    }
    
    try {
      // Try to delete the requested file
      const response = await axios.delete(`http://${HOST}/delete`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        data: { file_id },
      });

      const isSuccess = response.data.success;
      const message = isSuccess ? 'File deleted successfully' : `File deletion failed: Unknown error`;

      if (onDelete) onDelete(createResultMessage(isSuccess, message));
    } catch (error) {
      console.error('Error deleting the file:', error); 
      if (onDelete) onDelete(createResultMessage(false, error.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <Container fluid>
      <Row className="table-row align-items-center r-h-3">
        <Col md={4}>{name}</Col>
        <Col md={1}>{file_type}</Col>
        <Col md={1}>{formatBytes(size)}</Col>
        <Col md={2}>{username}</Col>
        <Col md={2}>{formatTimestamp(last_modify)}</Col>
        <Col md={2} className="d-flex justify-content-end">
          <Button
            variant="success"
            className="w-40 me-2"
            onClick={handleDownload}
          >
            Download
          </Button>
          <Button
            variant="danger"
            className="w-40"
            disabled={!token}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default FileView;
