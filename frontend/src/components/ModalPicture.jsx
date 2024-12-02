import React, { useState } from 'react';
import { Modal, Image } from 'react-bootstrap';
import styles from './ModalPicture.module.css';

const ModalPicture = ({ img }) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    console.log('cliecked');
    setShow(true);
  };

  return (
    <>
      <Image
        src={img}
        alt='thumbnail'
        fluid
        className='rounded'
        onClick={handleShow}
        style={{ cursor: 'pointer' }}
      />

      <Modal
        show={show}
        onHide={handleClose}
        dialogClassName={styles.modalFullscreen}
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Body className={styles.modalContent}>
          <button className={styles.closeButton} onClick={handleClose}>
            &times;
          </button>
          <Image src={img} alt='full-size' className={styles.fullImage} />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ModalPicture;
