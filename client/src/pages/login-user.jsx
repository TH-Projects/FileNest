import { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contextes/auth-context';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import '../style/AccountPage.css';

const HOST = import.meta.env.VITE_APP_HOST


const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Handle form submission of the login form
  const handleSubmit = async (event) => {
    event.preventDefault();

    const hashedPassword = CryptoJS.SHA256(password).toString();

    try {
      // Send login request to the database server
      const { data, status } = await axios.post(`http://${HOST}/loginUser`, {
        username,
        password: hashedPassword
      });

      if (status === 200 && data.success) {
        // Create user data object
        const userData = {
          username,
          token: data.token
        };
        login(userData);  // Save user data in context
        navigate('/'); // Nav to home page
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again later.');
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
