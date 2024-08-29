import { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contextes/auth-context';
import CryptoJS from 'crypto-js';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Hash the password
    const hashedPassword = CryptoJS.SHA256(password).toString();

    try {
      const response = await fetch('http://localhost/loginUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: hashedPassword })
      });

      const data = await response.json();

      if (response.ok) {
        // Login erfolgreich
        login({ username, password }); // Set logged-in user in context
        navigate('/'); // Navigate to Dashboard
      } else {
        // Fehlerbehandlung
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <Container fluid className="auth-container">
      <Row style={{ minHeight: '20vh' }}></Row>
      <Row md={6} className="justify-content-md-center">
        <Col md={6} lg={4}>
          <h2 className="text-center">Login</h2>
          {error && <p className="text-danger">{error}</p>}
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

            <Button variant="primary" type="submit">
              Login
            </Button>
          </Form>
          <p className="mt-3 text-center">
            No account? <Link to="/register">Register</Link>
          </p>
        </Col>
      </Row>
      <Row style={{ minHeight: '20vh' }}></Row>
    </Container>
  );
};

export default LoginPage;
