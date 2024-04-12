import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  ListGroup,
  Image,
  Form,
  Button,
  Card,
} from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import Message from '../components/Message';
import { addToCart, removeFromCart } from '../slices/cartSlice';

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  // NOTE: no need for an async function here as we are not awaiting the
  // resolution of a Promise
  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  return (
    <Row>
      <Col md={8}>
        <h1 style={{ marginBottom: '20px' }}>
          {process.env.REACT_APP_CHINESE ? '购物车' : 'Shopping Cart'}
        </h1>
        {cartItems.length === 0 ? (
          <Message>
            {process.env.REACT_APP_CHINESE
              ? '您的购物车为空'
              : 'Your cart is empty'}{' '}
            <Link to='/'>
              {process.env.REACT_APP_CHINESE ? '返回' : 'Go Back'}
            </Link>
          </Message>
        ) : (
          <ListGroup variant='flush'>
            {cartItems.map((item) => (
              <ListGroup.Item key={item._id}>
                <Row>
                  <Col xs={6} sm={6} md={6} lg={4} xl={3}>
                    <Image src={item.image} alt={item.name} fluid rounded />
                  </Col>
                  <Col xs={6} sm={6} md={6} lg={8} xl={9}>
                    <Col md={3}>
                      <Link to={`/product/${item._id}`}>{item.name}</Link>
                    </Col>
                    <Col md={2}>
                      {process.env.REACT_APP_CHINESE ? '¥' : '$'}
                      {item.price}
                    </Col>
                    <Col md={2} xs={5} sm={6}>
                      <Form.Control
                        as='select'
                        value={item.qty}
                        onChange={(e) =>
                          addToCartHandler(item, Number(e.target.value))
                        }
                      >
                        {[...Array(6).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col md={2}>
                      <Button
                        type='button'
                        variant='light'
                        onClick={() => removeFromCartHandler(item._id)}
                      >
                        <FaTrash />
                      </Button>
                    </Col>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>
      <Col md={4}>
        <Card>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>
                {process.env.REACT_APP_CHINESE ? '共' : 'Subtotol'} (
                {cartItems.reduce((acc, item) => acc + item.qty, 0)})
                {process.env.REACT_APP_CHINESE ? '件' : 'items'}
              </h2>
              {process.env.REACT_APP_CHINESE ? '¥' : '$'}
              {cartItems
                .reduce((acc, item) => acc + item.qty * item.price, 0)
                .toFixed(2)}
            </ListGroup.Item>
            <ListGroup.Item>
              <Button
                type='button'
                className='btn-block'
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                {process.env.REACT_APP_CHINESE
                  ? '去结算'
                  : 'Proceed To Checkout'}
              </Button>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  );
};

export default CartScreen;
