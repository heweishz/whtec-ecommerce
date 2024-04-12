import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { saveShippingAddress } from '../slices/cartSlice';
import { savePaymentMethod } from '../slices/cartSlice';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { toast } from 'react-toastify';
const ShippingScreen = () => {
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress.address || '忽略');
  const [city, setCity] = useState(shippingAddress.city || '忽略');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || '忽略'
  );
  const [country, setCountry] = useState(shippingAddress.country || '忽略');
  const [phone, setPhone] = useState(shippingAddress.phone || '建议留');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
        tableNumber: localStorage.getItem('tableNumber'),
      }).unwrap();
      // dispatch(clearCartItems());
      setTimeout(navigate(`/order/${res._id}`), [300]);
    } catch (err) {
      toast.error(err);
    }
  };
  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      saveShippingAddress({ address, city, postalCode, country, phone })
    );
    dispatch(savePaymentMethod('uncertain'));
    placeOrderHandler();
    // navigate('/placeorder');
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />
      <h1>{process.env.REACT_APP_CHINESE ? '收货地址' : 'Shipping'}</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className='my-2' controlId='country'>
          <Form.Label>
            <strong>{process.env.REACT_APP_CHINESE ? '电话' : 'Phone'}</strong>
          </Form.Label>
          <Form.Control
            type='text'
            placeholder={
              process.env.REACT_APP_CHINESE ? '请输入电话' : ' Enter Phone'
            }
            value={phone}
            required
            onChange={(e) => setPhone(e.target.value)}
          ></Form.Control>
          {/* <Form.Group className='my-2' controlId='country'>
            <Form.Label>
              {process.env.REACT_APP_CHINESE ? '省' : 'Country'}
            </Form.Label>
            <Form.Control
              type='text'
              placeholder={
                process.env.REACT_APP_CHINESE ? '请输入省份' : ' Enter Country'
              }
              value={country}
              required
              onChange={(e) => setCountry(e.target.value)}
            ></Form.Control>
          </Form.Group> */}

          {/* <Form.Group className='my-2' controlId='city'>
            <Form.Label>
              {process.env.REACT_APP_CHINESE ? '城市' : 'City'}
            </Form.Label>
            <Form.Control
              type='text'
              placeholder={
                process.env.REACT_APP_CHINESE ? '请输入城市' : 'Enter city'
              }
              value={city}
              required
              onChange={(e) => setCity(e.target.value)}
            ></Form.Control>
          </Form.Group> */}

          <Form.Group className='my-2' controlId='address'>
            <Form.Label>
              {process.env.REACT_APP_CHINESE ? '详细地址' : 'Address'}
            </Form.Label>
            <Form.Control
              type='text'
              placeholder={
                process.env.REACT_APP_CHINESE ? '输入详细地址' : 'Enter Address'
              }
              value={address}
              required
              onChange={(e) => setAddress(e.target.value)}
            ></Form.Control>
          </Form.Group>

          {/* <Form.Group className='my-2' controlId='postalCode'>
            <Form.Label>
              {process.env.REACT_APP_CHINESE ? '邮编' : 'Postal Code'}
            </Form.Label>
            <Form.Control
              type='text'
              placeholder={
                process.env.REACT_APP_CHINESE
                  ? '请输入邮编'
                  : 'Enter postal code'
              }
              value={postalCode}
              required
              onChange={(e) => setPostalCode(e.target.value)}
            ></Form.Control>
          </Form.Group> */}
        </Form.Group>

        <Button type='submit' variant='primary'>
          {process.env.REACT_APP_CHINESE ? '下一步' : 'Continue'}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default ShippingScreen;
