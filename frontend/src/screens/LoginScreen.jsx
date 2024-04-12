import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';

import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <h1>{process.env.REACT_APP_CHINESE ? '登入' : 'Sign In'}</h1>

      <Form onSubmit={submitHandler}>
        <Form.Group className='my-2' controlId='email'>
          <Form.Label>
            {process.env.REACT_APP_CHINESE ? '邮箱地址' : 'Email Address'}
          </Form.Label>
          <Form.Control
            type='email'
            placeholder={
              process.env.REACT_APP_CHINESE ? '输入邮箱' : 'Enter Email'
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='password'>
          <Form.Label>
            {process.env.REACT_APP_CHINESE ? '输入密码' : 'Password'}
          </Form.Label>
          <Form.Control
            type='password'
            placeholder={process.env.REACT_APP_CHINESE ? '密码' : 'Password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button disabled={isLoading} type='submit' variant='primary'>
          {process.env.REACT_APP_CHINESE ? '登入' : 'Sign In'}
        </Button>

        {isLoading && <Loader />}
      </Form>

      <Row className='py-3'>
        <Col>
          {process.env.REACT_APP_CHINESE ? '新用户？' : 'New Customer?'}{' '}
          <Link to={redirect ? `/register?redirect=${redirect}` : '/register'}>
            {process.env.REACT_APP_CHINESE ? '注册' : 'Register'}
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginScreen;
