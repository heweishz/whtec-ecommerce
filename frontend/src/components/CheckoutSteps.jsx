import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <Nav className='justify-content-center mb-4'>
      <Nav.Item>
        {step1 ? (
          <LinkContainer to='/login'>
            <Nav.Link>
              {process.env.REACT_APP_CHINESE ? '登陆' : 'Sign In'}
            </Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled>
            {process.env.REACT_APP_CHINESE ? '登陆' : 'Sign In'}
          </Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {step2 ? (
          <LinkContainer to='/shipping'>
            <Nav.Link>
              {process.env.REACT_APP_CHINESE ? '收货信息' : 'Shipping'}
            </Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled>
            {process.env.REACT_APP_CHINESE ? '收货信息' : 'Shipping'}
          </Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {step3 ? (
          <LinkContainer to='/payment'>
            <Nav.Link>
              {process.env.REACT_APP_CHINESE ? '支付方式' : 'Payment'}
            </Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled>
            {process.env.REACT_APP_CHINESE ? '支付方式' : 'Payment'}
          </Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {step4 ? (
          <LinkContainer to='/placeorder'>
            <Nav.Link>
              {process.env.REACT_APP_CHINESE ? '下单' : 'Place Order'}
            </Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled>
            {process.env.REACT_APP_CHINESE ? '下单' : 'Place Ordre'}
          </Nav.Link>
        )}
      </Nav.Item>
    </Nav>
  );
};

export default CheckoutSteps;
