import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Image from 'react-bootstrap/Image';
import Qrcode from '../assets/qrcode.png';

function ModalPromotion() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant='primary' className='w-100' onClick={handleShow}>
        扫码优惠加客服
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>加客服享优惠</Modal.Title>
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

export default ModalPromotion;
