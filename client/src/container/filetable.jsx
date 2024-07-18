import { Container, Row, Col } from "react-bootstrap";
import Card from "react-bootstrap/Card";

import "../style/tables.css";

const FileTable = () => {
  return (
    <Container fluid style={{ marginTop: "30px", marginBottom: "30px" }}>
      <Row className="h-100">
        <Col md={2}></Col>
        <Col md={8}>
          <Card bg="dark" text="white" key="dark" className="mb-2 h-100">
            <Card.Header style={{ padding: "0", height: "5vh" }}>
              <Container fluid className="h-100">
                <Row className="align-items-center h-100">
                  <Col className="first-column" md={3}>
                    Filename
                  </Col>
                  <Col className="vertical-line" md={1}>
                    Format
                  </Col>
                  <Col className="vertical-line" md={1}>
                    Size
                  </Col>
                  <Col className="vertical-line" md={2}>
                    Owner
                  </Col>
                  <Col className="vertical-line" md={2}>
                    Modified
                  </Col>
                  <Col className="vertical-line" md={3}>
                    Space
                  </Col>
                </Row>
              </Container>
            </Card.Header>
            <Card.Body></Card.Body>
          </Card>
        </Col>
        <Col md={2}></Col>
      </Row>
    </Container>
  );
};

export default FileTable;
