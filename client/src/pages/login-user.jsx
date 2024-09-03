import { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contextes/auth-context';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import '../style/AccountPage.css';

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
      const { data, status } = await axios.post('http://localhost/loginUser', {
        username,
        password: hashedPassword
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (status === 200 && data.success) {
        // Login erfolgreich
        const userData = { username, password: hashedPassword };
        login(userData); // Set userData in context and localStorage

        navigate('/'); // Nav to home page
      } else {
        setError(data.message || 'Login fehlgeschlagen');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später erneut.');
    }
  };

  return (
    <Container className="auth-container">
      <Row className="justify-content-center align-items-center h-100 row-expanded-width">
        <Col md={6} lg={4} className="form-col">
          <h2 className="text-center">Login</h2>
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
    </Container>
  );
};

export default LoginPage;
