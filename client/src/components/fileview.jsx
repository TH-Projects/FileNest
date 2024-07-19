/* eslint-disable react/prop-types */
import { Container, Row, Col, Button } from "react-bootstrap";
import "../style/cards.css";

const FileView = ({ file_meta_data }) => {
  return (
    <Container fluid>
      <Row className="table-row">
        <Col md={4}>{file_meta_data.name}</Col>
        <Col md={1}>{file_meta_data.extension}</Col>
        <Col md={1}>{file_meta_data.size}</Col>
        <Col md={2}>{file_meta_data.owner}</Col>
        <Col md={2}>{file_meta_data.modified}</Col>
        <Col md={2} className="d-flex justify-content-end">
          <Button variant="success" className="w-50 me-2">
            Download
          </Button>
          <Button variant="danger" className="w-50">
            Delete
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default FileView;
