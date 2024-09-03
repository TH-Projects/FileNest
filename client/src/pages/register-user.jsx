import { useState } from 'react';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/AccountPage.css'; // Importiere CSS-Datei für Stile

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
      const { data, status } = await axios.post('http://localhost/checkAndCreateUser', {
        username,
        email,
        password
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (status === 200) {
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed!');
      }
    } catch (error) {      
      setError(error.response.data.message || 'An error occurred while registering the user.');
    }
  };

  return (
    <Container className="auth-container">
      <Row className="justify-content-center align-items-center h-100 row-expanded-width">
        <Col md={6} lg={4} className="form-col">
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
    </Container>
  );
};

export default RegisterPage;
