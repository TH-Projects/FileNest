import { Container, Row, Col, Button } from "react-bootstrap";
import Card from "react-bootstrap/Card";

import FileView from "../components/fileview";
//import SingleSelect from "../components/singleselect";
import MultiSelect from "../components/multiselect";

import "../style/tables.css";

const FileTable = () => {
  const test_data = [
    {
      name: "some name",
      extension: ".txt",
      size: "5 MB",
      owner: "polar_bear123",
      modified: new Date().toLocaleString(),
    },
    {
      name: "some name2",
      extension: ".txt",
      size: "5 MB",
      owner: "polar_bear123",
      modified: new Date().toLocaleString(),
    },
    {
      name: "some name3",
      extension: ".txt",
      size: "5 MB",
      owner: "polar_bear123",
      modified: new Date().toLocaleString(),
    },
    {
      name: "some name4",
      extension: ".txt",
      size: "5 MB",
      owner: "polar_bear123",
      modified: new Date().toLocaleString(),
    },
    {
      name: "some name5",
      extension: ".txt",
      size: "5 MB",
      owner: "polar_bear123",
      modified: new Date().toLocaleString(),
    },
  ];

  const renderFileViews = (data) => {
    return data.map((file, index) => (
      <FileView key={index} file_meta_data={file} />
    ));
  };
  const opt = ["test1", "Test2"];

  return (
    <Container fluid style={{ marginTop: "30px", marginBottom: "30px" }}>
      <Row className="justify-content-center mb-3">
        <Col md={2}>
          <MultiSelect placeholder="Select filename" options={opt} />
        </Col>
        <Col md={2}>
          <MultiSelect placeholder="Select file extension" options={opt} />
        </Col>
        <Col md={2}>
          <MultiSelect placeholder="Select owner" options={opt} />
        </Col>
        <Col md={3}></Col>
        <Col md={1} className="d-flex justify-content-end">
          <Button variant="success" className="btn-md ">
            +
          </Button>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={10}>
          <Card bg="dark" text="white">
            <Card.Header>
              <Container fluid>
                <Row className="table-header">
                  <Col md={4}>Filename</Col>
                  <Col md={1}>Extension</Col>
                  <Col md={1}>Size</Col>
                  <Col md={2}>Owner</Col>
                  <Col md={2}>Modified</Col>
                  <Col md={2}>Actions</Col>
                </Row>
              </Container>
            </Card.Header>
            <Card.Body>{renderFileViews(test_data)}</Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FileTable;
