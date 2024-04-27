import { Card, Row, Col, Image } from 'react-bootstrap';
import cart from '../assets/cart.svg';
import { Link } from 'react-router-dom';
// import Rating from './Rating';
import { useDispatch } from 'react-redux';
import { addOneToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import PannellumScreen from '../components/PannellumScreen';

const Product = ({ product }) => {
  const gsapRef = useRef(null);
  const dispatch = useDispatch();
  const addOneToCartHandler = () => {
    dispatch(addOneToCart({ ...product, qty: 1 }));
    if (gsapRef.current) {
      gsap.to(gsapRef.current, {
        rotation: 360,
        repeat: 2,
        yoyo: true,
        ease: 'bounce.in',
      });
    }
  };
  useGSAP(() => {
    gsap.to('#cart', {
      x: 20,
      repeat: 3,
      yoyo: true,
      ease: 'bounce.in',
    });
  }, []);
  const redirectToProduct = () => {
    // Manually redirect using window.location.href
    window.location.href = `/product/${product._id}`;
  };
  return (
    <Card className='my-3 p-3 rounded '>
      <Card.Img src={product.image} variant='top' onClick={redirectToProduct} />
      {/* <PannellumScreen image={product.image} /> */}

      <Card.Body>
        <Card.Title
          as='div'
          className='product-title'
          onClick={redirectToProduct}
        >
          <strong>{product.name}</strong>
        </Card.Title>

        {/* <Card.Text as='div'>
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
        </Card.Text> */}
        <Row>
          <Col xs={12} sm={8}>
            <Card.Text as='h3'>
              {process.env.REACT_APP_CHINESE ? '¥' : '$'}
              {product.price}
            </Card.Text>
          </Col>
          <Col xs={12} sm={4}>
            <Image
              ref={gsapRef}
              id='cart'
              onClick={addOneToCartHandler}
              width={30}
              src={cart}
              fluid
              rounded
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default Product;
