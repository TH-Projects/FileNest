/* eslint-disable react/prop-types */
import { Container, Row, Col, Button } from "react-bootstrap";
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
    hour12: false, // 24-Stunden-Format
  }).replace(',', ''); // Entfernen des Kommas zwischen Datum und Uhrzeit
};

const FileView = ({ file_meta_data }) => {
  return (
    <Container fluid>
      <Row className="table-row align-items-center r-h-3">
        <Col md={4}>{file_meta_data.name}</Col>
        <Col md={1}>{file_meta_data.extension}</Col>
        <Col md={1}>{file_meta_data.size}</Col>
        <Col md={2}>{file_meta_data.owner}</Col>
        <Col md={2}>{formatTimestamp(file_meta_data.lastModified)}</Col>
        <Col md={2} className="d-flex justify-content-end">
          <Button variant="success" className="w-40 me-2">
            Download
          </Button>
          <Button variant="danger" className="w-40">
            Delete
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default FileView;
