import {Container, Row, Col} from 'react-bootstrap'
import Card from 'react-bootstrap/Card'

const FileTable = () => {
    return (
        <Container fluid style={{marginTop: '30px', marginBottom: '30px'}}>
            <Row className='h-100'>
                <Col md={2}></Col>
                <Col md={8}>
                    <Card bg='dark' text='white' className="mb-2 h-100">
                        <Card.Header className='bg-dark'>
                            This is my Header
                        </Card.Header>
                        <Card.Body>
                        <h1>hello</h1>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}></Col>
            </Row>
        </Container>
      );
}

export default FileTable;
