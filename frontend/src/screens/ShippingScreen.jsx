import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import {
  resetCart,
  clearCartItems,
  saveShippingAddress,
} from '../slices/cartSlice';
import { savePaymentMethod } from '../slices/cartSlice';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { toast } from 'react-toastify';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';

const ShippingScreen = () => {
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(
    shippingAddress.address || '如外卖，请留地址'
  );
  const [city, setCity] = useState(shippingAddress.city || '忽略');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || '忽略'
  );
  const [country, setCountry] = useState(shippingAddress.country || '忽略');
  const [phone, setPhone] = useState(
    shippingAddress.phone || '如外卖，请留电话'
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      // NOTE: here we need to reset cart state for when a user logs out so the next
      // user doesn't inherit the previous users cart and shipping
      dispatch(resetCart());
      dispatch(clearCartItems());
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };
  const placeOrderHandler = async () => {
    let cartEdited = JSON.parse(localStorage.getItem('cart'));
    try {
      const res = await createOrder({
        orderItems: cartEdited.cartItems,
        shippingAddress: cartEdited.shippingAddress,
        paymentMethod: cartEdited.paymentMethod,
        itemsPrice: cartEdited.itemsPrice,
        shippingPrice: cartEdited.shippingPrice,
        taxPrice: cartEdited.taxPrice,
        totalPrice: cartEdited.totalPrice,
        tableNumber: localStorage.getItem('tableNumber'),
      }).unwrap();

      // dispatch(resetCart());
      dispatch(clearCartItems());
      // if (res.shippingAddress?.address) {
      //   navigate(`/order/${res._id}`);
      // }
      setTimeout((window.location.href = `/order/${res._id}`), [300]);
    } catch (err) {
      console.log(err.status);
      toast.error(err.data.message);
      logoutHandler();
    }
  };
  // const sendNavigator = async (signal) => {
  //   await axios.post('/api/users/sendNavigator', {
  //     environment: `${navigator.userAgent}--${signal}`,
  //   });
  // };
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
