/* eslint-disable react/prop-types */
import { Container, Row, Col, Button } from "react-bootstrap";
import { useAuth } from "../contextes/auth-context";

import { saveAs } from 'file-saver';
import "../style/cards.css";

// Utility function to format a timestamp
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('de-DE', {
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

const FileView = ({ file_meta_data }) => {
  const { user } = useAuth();

  const handleDownload = async (filename) => {
    try {
      const response = await fetch(`http://localhost:3000/download/${filename}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      saveAs(blob, filename); // Use the dynamic file name
    } catch (error) {
      console.error('Error downloading the file:', error);
      alert('Fehler beim Herunterladen der Datei');
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
          <Button variant="danger" className="w-40" disabled={!user}>
            Delete
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default FileView;
