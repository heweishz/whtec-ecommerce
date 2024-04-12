import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Image } from 'react-bootstrap';
import { useVerifyEmailQuery } from '../slices/usersApiSlice';
const ResultGetcodescreen = () => {
  const { data: emailExist, isLoading } = useVerifyEmailQuery();
  if (!isLoading) {
    console.log(emailExist, '<<emailExist');
  }
  const [code, setCode] = useState('');
  const [image, setImage] = useState('');
  const location = useLocation();
  const locationUrl = new URLSearchParams(location.search);
  const urlCode = locationUrl.get('code');

  useEffect(() => {
    setCode(urlCode);

    // getToken();
  }, []);
  return (
    <>
      <button>{code}</button>
    </>
  );
};
export default ResultGetcodescreen;
