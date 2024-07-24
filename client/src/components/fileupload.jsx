/* eslint-disable react/prop-types */
import { Modal, Button } from 'react-bootstrap';
import '../style/modal.css';

const FileUpload = ({ show, handleClose, handleFileChange, handleUpload }) => {
  return (
    <Modal 
      centered 
      size="lg"
      show={show} 
      onHide={handleClose} 
      className='modal-light'
    >
      <Modal.Header closeButton>
        <Modal.Title>Upload File</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="file-input"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleClose}>
          Abort
        </Button>
        <Button variant="success" onClick={handleUpload}>
          Upload
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FileUpload;
