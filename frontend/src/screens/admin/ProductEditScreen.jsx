import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Image } from 'react-bootstrap';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useDeleteProductImageMutation,
  useUploadProductImageMutation,
  useUpdateProductImageMultipleMutation,
  useUploadMultipleProductImageMutation,
} from '../../slices/productsApiSlice';

const ProductEditScreen = () => {
  const { id: productId } = useParams();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState();
  const [imageDesc, setImageDesc] = useState([]);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const [updateProduct, { isLoading: loadingUpdate }] =
    useUpdateProductMutation();

  const [uploadProductImage, { isLoading: loadingUpload }] =
    useUploadProductImageMutation();
  const [deleteProductImage, { isLoading: loadingDeleteImage }] =
    useDeleteProductImageMutation();
  const [uploadMultipleProductImage, { isLoading: loadingUploadMultiple }] =
    useUploadMultipleProductImageMutation();
  const [
    updateProductImageMultiple,
    { isLoading: loadingDeleteImageByAddress },
  ] = useUpdateProductImageMultipleMutation();

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateProduct({
        productId,
        name,
        price,
        image,
        imageDesc,
        brand,
        category,
        description,
        countInStock,
      }).unwrap(); // NOTE: here we need to unwrap the Promise to catch any rejection in our catch block
      toast.success('Product updated');
      refetch();
      navigate('/admin/productlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setImage(product.image);
      setImageDesc([...product.imageDesc]);
      setBrand(product.brand);
      setCategory(product.category);
      setCountInStock(product.countInStock);
      setDescription(product.description);
    }
  }, [product]);

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      // if (image.length === 1) {
      //   setImage(() => [res.image]);
      // } else {
      //   setImage((prev) => [...prev, res.image]);
      // }

      //Delete orginal image
      try {
        await deleteProductImage(productId);
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
      setImage(() => res.image);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };
  const uploadMultipleFileHandler = async (e) => {
    const formData = new FormData();

    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('images', e.target.files[i]);
    }
    try {
      const res = await uploadMultipleProductImage(formData).unwrap();
      toast.success(res.message);
      setImageDesc((prev) => [...prev, ...res.images]);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };
  const deleteImageMultipleHandle = async (img) => {
    try {
      await updateProductImageMultiple({ productId, img });
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
    const tmpArray = imageDesc.filter(
      (oldImage) => oldImage.split('/')[2] !== img.split('/')[4]
    );
    setImageDesc([...tmpArray]);
  };

  return (
    <>
      <Link to='/admin/productlist' className='btn btn-light my-3'>
        {process.env.REACT_APP_CHINESE ? '返回' : 'Go Back'}
      </Link>
      <FormContainer>
        <h1>{process.env.REACT_APP_CHINESE ? '编辑商品' : 'Edit Product'}</h1>
        {loadingUpdate && <Loader />}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error.data.message}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId='name'>
              <Form.Label>
                {process.env.REACT_APP_CHINESE ? '名称' : 'Name'}
              </Form.Label>
              <Form.Control
                type='name'
                placeholder='Enter name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='price'>
              <Form.Label>
                {process.env.REACT_APP_CHINESE ? '价格' : 'Price'}
              </Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter price'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='image'>
              <Form.Label>
                {process.env.REACT_APP_CHINESE ? '主图片' : 'Image'}
              </Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter image url'
                value={image || ''}
                onChange={(e) => {
                  setImage(e.target.value);
                }}
              ></Form.Control>
              <Form.Control
                label='Choose File'
                onChange={uploadFileHandler}
                type='file'
              ></Form.Control>
              {(loadingUpload || loadingDeleteImage) && <Loader />}
            </Form.Group>
            {!image ? '' : <Image src={image} style={{ width: '30px' }} />}

            <Form.Group controlId='image1'>
              <Form.Label>
                {process.env.REACT_APP_CHINESE ? '更多图片' : 'More image'}
              </Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter image1 url'
                value={
                  imageDesc[`${imageDesc.length - 1}`]
                    ? imageDesc[`${imageDesc.length - 1}`]
                    : ''
                }
                onChange={(e) => {
                  console.log(e.target.value, '<<<multiple files<<<');
                  // setImageDesc((prev) => [...prev, e.target.value]);
                  console.log('first');
                }}
              ></Form.Control>
              <Form.Control
                label='Choose File'
                onChange={uploadMultipleFileHandler}
                type='file'
                multiple
              ></Form.Control>
              {(loadingUploadMultiple || loadingDeleteImageByAddress) && (
                <Loader />
              )}
            </Form.Group>
            {/* {product.imageDesc.length === 0
              ? ''
              : product.imageDesc.map((img, i) => (
                  <Image key={i} src={img} style={{ width: '30px' }} />
                ))} */}
            {imageDesc.map((img, i) => (
              <Image
                key={i}
                src={img}
                style={{ width: '30px' }}
                onClick={(e) => {
                  deleteImageMultipleHandle(e.target.src);
                }}
              />
            ))}
            {/* <Image src={imageDesc} style={{ width: '30px' }} /> */}

            <Form.Group controlId='brand'>
              <Form.Label>
                {process.env.REACT_APP_CHINESE ? '品牌' : 'Brand'}
              </Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter brand'
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='countInStock'>
              <Form.Label>
                {process.env.REACT_APP_CHINESE ? '库存' : 'Count In Stock'}
              </Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter countInStock'
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
              ></Form.Control>
            </Form.Group>

            {/* <Form.Group controlId='category'>
              <Form.Label>
                {process.env.REACT_APP_CHINESE ? '分类' : 'Category'}
              </Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter category'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              ></Form.Control>
            </Form.Group> */}
            <Form.Group controlId='category'>
              <Form.Label>
                {process.env.REACT_APP_CHINESE ? '分类' : 'Category'}
              </Form.Label>
              <Form.Control
                as='select'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value='饮料'>饮料</option>
                <option value='卤味'>卤味</option>
                <option value='其它'>其它</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId='description'>
              <Form.Label>
                {process.env.REACT_APP_CHINESE ? '产品描述' : 'Descrioption'}
              </Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Button
              type='submit'
              variant='primary'
              style={{ marginTop: '1rem' }}
              disabled={
                loadingUpload ||
                loadingUploadMultiple ||
                loadingDeleteImageByAddress
              }
            >
              {process.env.REACT_APP_CHINESE ? '更新' : 'Update'}
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default ProductEditScreen;
