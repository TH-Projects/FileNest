/* eslint-disable react/prop-types */
import { Modal, Button } from 'react-bootstrap';
import '../style/modal.css';

const GenericModal = ({
  show,
  title,
  children,
  onClose,
  onSubmit,
  confirmText = 'Confirm',
  size = 'lg',
  variant = 'success',
}) => (
  <Modal
    centered
    show={show}
    onHide={onClose}
    size={size}
    contentClassName="modal-light"
  >
    <Modal.Header closeButton>
      <Modal.Title className="text-dark">{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body className="text-dark">
      {children}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="danger" onClick={onClose}>
        Cancel
      </Button>
      <Button variant={variant} onClick={onSubmit}>
        {confirmText}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default GenericModal;
