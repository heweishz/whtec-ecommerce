import React, { useEffect, useState } from 'react';
import { Table, Form, Button, Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { Image } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useProfileMutation } from '../slices/usersApiSlice';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import { setCredentials } from '../slices/authSlice';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { userInfo } = useSelector((state) => state.auth);

  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();

  useEffect(() => {
    setName(userInfo.name);
    setEmail(userInfo.email);
  }, [userInfo.email, userInfo.name]);

  const dispatch = useDispatch();
  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      try {
        const res = await updateProfile({
          _id: userInfo._id,
          name,
          email,
          password,
        }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success('Profile updated successfully');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <Row>
      <Col md={9}>
        <h2>{process.env.REACT_APP_CHINESE ? '我的订单' : 'My Orders'}</h2>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <>
            <Table striped hover responsive className='table-sm'>
              <thead>
                <tr>
                  <th>{process.env.REACT_APP_CHINESE ? '订单号' : 'ID'}</th>
                  <th>{process.env.REACT_APP_CHINESE ? '日期' : 'DATE'}</th>
                  <th>{process.env.REACT_APP_CHINESE ? '总价' : 'TOTAL'}</th>
                  <th>{process.env.REACT_APP_CHINESE ? '支付时间' : 'PAID'}</th>
                  <th>{process.env.REACT_APP_CHINESE ? '发货' : 'DELIVERD'}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      {order.orderItems.map((item) => {
                        return (
                          <span>
                            <Image
                              src={item.image}
                              alt={item.name}
                              fluid
                              rounded
                              width={30}
                            />
                            <span>{item.qty}</span>
                          </span>
                        );
                      })}
                    </td>
                    <td>{order.createdAt}</td>
                    <td>
                      {process.env.REACT_APP_CHINESE ? '¥' : '$'}
                      {order.totalPrice}
                    </td>
                    <td style={{ color: 'green' }}>
                      {order.isPaid ? (
                        order.paidAt
                      ) : (
                        // order.paidAt.substring(0, 10)
                        <FaTimes style={{ color: 'red' }} />
                      )}
                    </td>
                    <td>
                      {order.isDelivered ? (
                        order.deliveredAt.substring(0, 10)
                      ) : (
                        <FaTimes style={{ color: 'red' }} />
                      )}
                    </td>
                    <td>
                      <LinkContainer to={`/order/${order._id}`}>
                        <Button className='btn-sm' variant='light'>
                          {process.env.REACT_APP_CHINESE ? '详情' : 'Details'}
                        </Button>
                      </LinkContainer>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </Col>
      <Col md={3}>
        <h2>{process.env.REACT_APP_CHINESE ? '用户资料' : 'User Profile'}</h2>

        <Form onSubmit={submitHandler}>
          <Form.Group className='my-2' controlId='name'>
            <Form.Label>
              {process.env.REACT_APP_CHINESE ? '姓名' : 'Name'}
            </Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter name'
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group className='my-2' controlId='email'>
            <Form.Label>
              {process.env.REACT_APP_CHINESE ? '邮箱地址' : 'Email Address'}
            </Form.Label>
            <Form.Control
              type='email'
              placeholder='Enter email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group className='my-2' controlId='password'>
            <Form.Label>
              {process.env.REACT_APP_CHINESE ? '修改密码' : 'Password'}
            </Form.Label>
            <Form.Control
              type='password'
              placeholder={
                process.env.REACT_APP_CHINESE ? '输入密码' : 'Enter password'
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group className='my-2' controlId='confirmPassword'>
            <Form.Label>
              {process.env.REACT_APP_CHINESE ? '确认密码' : 'Confirm Password'}
            </Form.Label>
            <Form.Control
              type='password'
              placeholder={
                process.env.REACT_APP_CHINESE ? '确认密码' : 'Confirm Password'
              }
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Button disabled={true} type='submit' variant='primary'>
            {process.env.REACT_APP_CHINESE ? '更新' : 'Update'}
          </Button>

          {loadingUpdateProfile && <Loader />}
        </Form>
      </Col>
    </Row>
  );
};

export default ProfileScreen;
