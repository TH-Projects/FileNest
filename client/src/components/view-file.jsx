/* eslint-disable react/prop-types */
import { Container, Row, Col, Button } from "react-bootstrap";
import { useAuth } from "../contextes/auth-context";
import axios from "axios";
import { saveAs } from 'file-saver';
import "../style/cards.css";

// Utility function to format a timestamp
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // 24-hour format
  }).replace(',', '');
};

// Utility function to format file size
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = Math.ceil(bytes / Math.pow(k, i));
  return size + " " + sizes[i];
}

const FileView = ({ file_meta_data, onDelete }) => {  
  const { user } = useAuth();

  const handleDownload = async (filename) => {
    try {
      const response = await axios.get(`http://localhost/download/${filename}`, {
        responseType: 'blob', // Important for file download
      });

      saveAs(response.data, filename); // Use the dynamic file name
    } catch (error) {
      console.error('Error downloading the file:', error);
      const resultMsg =        
        <h5 className="text-danger fs-6 mt-2 mb-2">
          Error downloading the file: {error.message}
        </h5>
      ;
      console.log(resultMsg);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    if(!fileId || !user) {
      const resultMsg =
        <h5 className="text-danger fs-6 mt-2 mb-2">
          Missing required parameters
        </h5>
      if (onDelete) onDelete(resultMsg);
      return;
    }
    
    try {
      const response = await axios.delete('http://localhost/delete', {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          file_id: fileId,
          username: user.username,
          password: user.password,
        },
      });

      if (response.data.success) {
        const resultMsg = 
          <h5 className="text-success fs-6 mt-2 mb-2">
            File deleted successfully
          </h5>
        if (onDelete) onDelete(resultMsg);
      } else {        
        const resultMsg = 
          <h5 className="text-danger fs-6 mt-2 mb-2">
            File deletion failed: {response.data.message || 'Unknown error'}
          </h5>
        if (onDelete) onDelete(resultMsg);
      }
      
    } catch (error) {
      console.error('Error deleting the file:', error);
      const resultMsg = 
        <h5 className="text-danger fs-6 mt-2 mb-2">
          Error while deleting the file: <br/>
          {error.response.data.message}
        </h5>;
      if (onDelete) onDelete(resultMsg);
    }
  };


  return (
    <Container fluid>
      <Row className="table-row align-items-center r-h-3">
        <Col md={4}>{file_meta_data.name}</Col>
        <Col md={1}>{file_meta_data.file_type}</Col>
        <Col md={1}>{formatBytes(file_meta_data.size)}</Col>
        <Col md={2}>{file_meta_data.username}</Col>
        <Col md={2}>{formatTimestamp(file_meta_data.last_modify)}</Col>
        <Col md={2} className="d-flex justify-content-end">
          <Button
            variant="success"
            className="w-40 me-2"
            disabled={!user}
            onClick={() => handleDownload(`${file_meta_data.name}.${file_meta_data.extension}`)}
          >
            Download
          </Button>
          <Button
            variant="danger"
            className="w-40"
            disabled={!user}
            onClick={() => handleDelete(file_meta_data.file_id)}
          >
            Delete
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default FileView;
