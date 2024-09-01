/* eslint-disable react/prop-types */
// FileView.js
import { Container, Row, Col, Button } from "react-bootstrap";
import { useAuth } from "../contextes/auth-context";
import axios from "axios";
import { saveAs } from 'file-saver';
import { formatTimestamp, formatBytes, createResultMessage } from '../utils/utils';
import "../style/cards.css";

const FileView = ({ file_meta_data, onDelete, onDownload }) => {  
  const { user } = useAuth();
  const { file_id, name, file_type, size, username, last_modify } = file_meta_data;

  const handleDownload = async () => {
    try {
      const response = await axios.get('http://localhost/download', {
        params: { file_id },
        responseType: 'blob',
      });

      if (onDownload) onDownload(createResultMessage(true, 'File downloaded successfully'));
      saveAs(response.data, `${name}.${file_type}`);
    } catch (error) {      
      if (onDownload) onDownload(createResultMessage(false, error.response.data.message));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    if(!file_id || !user) {
      if (onDelete) onDelete(createResultMessage(false, 'Missing required parameters'));
      return;
    }
    
    try {
      const response = await axios.delete('http://localhost/delete', {
        headers: { 'Content-Type': 'application/json' },
        data: { file_id, username: user.username, password: user.password },
      });

      const isSuccess = response.data.success;
      const message = isSuccess ? 'File deleted successfully' : `File deletion failed: Unknown error}`;

      if (onDelete) onDelete(createResultMessage(isSuccess, message));
    } catch (error) {
      console.error('Error deleting the file:', error); 
      if (onDelete) onDelete(createResultMessage(false, error.response.data.message));
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
            disabled={!user}
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
