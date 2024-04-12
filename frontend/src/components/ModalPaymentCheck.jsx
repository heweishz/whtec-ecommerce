import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Image from 'react-bootstrap/Image';
import Qrcode from '../assets/qrcode.png';

function ModalpaymentCheck({ checkDetails }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant='primary' className='w-70' onClick={handleShow}>
        {checkDetails.totalAmount}
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{checkDetails.buyerPayAmount}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Image src={Qrcode} fluid />
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            关闭
          </Button>
          {/* <Button variant='primary' onClick={handleClose}>
            Save Changes
          </Button> */}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalpaymentCheck;
