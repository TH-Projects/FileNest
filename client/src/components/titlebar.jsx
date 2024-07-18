import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";

const Titlebar = () => {
  return (
    <Navbar className="bg-dark navbar-dark">
      <Container fluid style={{ marginLeft: "50px", marginRight: "50px" }}>
        <Navbar.Brand>
          <Image src="logo.png" rounded style={{ maxHeight: "90px" }} />
        </Navbar.Brand>
        <Navbar.Text className="text-center">
          <h5 className="display-6 text-white">FileNest - Dashboard</h5>
        </Navbar.Text>
        <Button variant="outline-info" size="lg">
          Log In
        </Button>
      </Container>
    </Navbar>
  );
};

export default Titlebar;
