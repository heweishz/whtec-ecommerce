import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
  Badge,
  Button,
} from 'react-bootstrap';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import SearchBox from './SearchBox';
import logo from '../assets/logo-doll.png';
import { resetCart } from '../slices/cartSlice';
import { clearCartItems } from '../slices/cartSlice';
import { useEffect, useState } from 'react';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  // const [switchLanguageSignal, setSwitchLanguageSignal] = useState(true);
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
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    localStorage.setItem('language', 'cn');
  }, []);
  const language = localStorage.getItem('language');
  // const switchLanguage = () => {
  //   setSwitchLanguageSignal((prev) => !prev);
  //   if (language === 'en') {
  //     localStorage.setItem('language', 'cn');
  //   } else if (language === 'cn') {
  //     localStorage.setItem('language', 'en');
  //   }
  // };
  return (
    <header>
      <Navbar bg='primary' variant='dark' expand='lg' collapseOnSelect>
        <Container>
          <LinkContainer to='/'>
            <Navbar.Brand>
              {userInfo ? (
                <img src={userInfo.icon} alt='ProShop' width='40px' />
              ) : (
                <img src={logo} alt='ProShop' width={30} />
              )}
              桅梁科技商城
            </Navbar.Brand>
          </LinkContainer>
          <LinkContainer to='/cart'>
            <Nav.Link>
              <FaShoppingCart />{' '}
              {process.env.REACT_APP_CHINESE ? '购物车' : 'Cart'}
              {cartItems.length > 0 && (
                <Badge pill bg='success' style={{ marginLeft: '5px' }}>
                  {cartItems.reduce((a, c) => a + c.qty, 0)}
                </Badge>
              )}
            </Nav.Link>
          </LinkContainer>
          {/* <Button onClick={switchLanguage}>switch language</Button> */}
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto'>
              <SearchBox />

              {userInfo ? (
                <>
                  <NavDropdown title={userInfo.name} id='username'>
                    <LinkContainer to='/profile'>
                      <NavDropdown.Item>
                        {process.env.REACT_APP_CHINESE ? '个人资料' : 'Profile'}
                      </NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={logoutHandler}>
                      {process.env.REACT_APP_CHINESE ? '登出' : 'ProfileLogout'}
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <LinkContainer to='/login'>
                  <Nav.Link>
                    <FaUser />{' '}
                    {process.env.REACT_APP_CHINESE ? '登入' : 'Sign In'}
                  </Nav.Link>
                </LinkContainer>
              )}

              {/* Admin Links */}
              {userInfo && userInfo.isAdmin && (
                <NavDropdown
                  title={process.env.REACT_APP_CHINESE ? '管理列表' : 'Admin'}
                  id='adminmenu'
                >
                  <LinkContainer to='/admin/productlist'>
                    <NavDropdown.Item>
                      {process.env.REACT_APP_CHINESE ? '产品' : 'Products'}
                    </NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/orderlist'>
                    <NavDropdown.Item>
                      {process.env.REACT_APP_CHINESE ? '订单' : 'Orders'}
                    </NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/userlist'>
                    <NavDropdown.Item>
                      {process.env.REACT_APP_CHINESE ? '用户' : 'Users'}
                    </NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
