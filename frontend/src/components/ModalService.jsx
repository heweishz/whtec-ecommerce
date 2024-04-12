import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Image from 'react-bootstrap/Image';
import Correct from '../assets/icon-correct.png';

const services = [
  '保密发货',
  '正品保障',
  '可货到付款',
  '7天退换货',
  '包邮',
  '优先发顺丰',
];
function ModalService() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant='primary' className='w-100' onClick={handleShow}>
        服务
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>我们提供</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {services.map((service, index) => (
            <span key={index}>
              <Image src={Correct} style={{ width: 20 }} fluid />
              {service}
            </span>
          ))}
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

export default ModalService;
