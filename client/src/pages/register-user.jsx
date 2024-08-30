/* eslint-disable no-useless-escape */
import { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
        setError("Passwords do not match!");
        return;
    }

    try {
        // Request Nginx-Proxy, to forward the request to the Fastify-Server        
        const response = await fetch('http://localhost/checkAndCreateUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok !== true) {
            const error = await response.text();
            const errorObject = JSON.parse(error);            
            setError(errorObject.message || 'Registration failed!');
        } else {
            //TODO: Log user instantly in after registration when login is implemented
            navigate('/login');
        }

    } catch (error) {
        setError('An error occurred while registering the user.');
    }
};

  return (
    <Container className="auth-container">
      <Row style={{ minHeight: '10vh' }}></Row>
      <Row className="justify-content-md-center">
        <Col md={6} lg={4}>
          <h2 className="text-center">Register</h2>
          {error && <p className="text-danger text-center">{error}</p>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicUsername" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicEmail" className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formConfirmPassword" className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mb-3">
              Register
            </Button>
          </Form>
          <p className="text-center">
            Already have an account? <Link to="/login">Log in here</Link>.
          </p>
        </Col>
      </Row>
      <Row style={{ minHeight: '10vh' }}></Row>
    </Container>
  );
};

export default RegisterPage;
