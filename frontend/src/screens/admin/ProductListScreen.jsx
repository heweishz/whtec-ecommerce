import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import Paginate from '../../components/Paginate';
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
} from '../../slices/productsApiSlice';
import { useSelector, useDispatch } from 'react-redux';
import { setProductsSort } from '../../slices/productsSortSlice';
import { toast } from 'react-toastify';

const ProductListScreen = () => {
  const { pageNumber } = useParams();
  const dispatch = useDispatch();
  const { productsSort } = useSelector((state) => state.sort);
  let sort = productsSort;
  const { data, isLoading, error, refetch } = useGetProductsQuery({
    pageNumber,
    sort,
  });
  const changeSort = (e) => {
    dispatch(setProductsSort(e.target.value));
  };

  const [deleteProduct, { isLoading: loadingDelete }] =
    useDeleteProductMutation();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure')) {
      try {
        await deleteProduct(id);
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const [createProduct, { isLoading: loadingCreate }] =
    useCreateProductMutation();

  const createProductHandler = async () => {
    if (
      window.confirm(
        process.env.REACT_APP_CHINESE
          ? '确认创建新商品'
          : 'Are you sure you want to create a new product?'
      )
    ) {
      try {
        await createProduct();
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>{process.env.REACT_APP_CHINESE ? '商品' : 'Products'}</h1>
        </Col>
        <Col className='text-end'>
          <Button className='my-3' onClick={createProductHandler}>
            <FaPlus />{' '}
            {process.env.REACT_APP_CHINESE ? '添加商品' : 'Create Product'}
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button value='name' onClick={(e) => changeSort(e)}>
            名字排序
          </Button>
          <Button value='-updatedAt' onClick={(e) => changeSort(e)}>
            上新排序
          </Button>
        </Col>
      </Row>
      {loadingCreate && <Loader />}
      {loadingDelete && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error.data.message}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                {/* <th>ID</th> */}
                <th>{process.env.REACT_APP_CHINESE ? '商品名' : 'NAME'}</th>
                <th>{process.env.REACT_APP_CHINESE ? '价格' : 'Price'}</th>
                <th>{process.env.REACT_APP_CHINESE ? '品类' : 'CATEGORY'}</th>
                <th>{process.env.REACT_APP_CHINESE ? '品牌' : 'BRAND'}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((product) => (
                <tr key={product._id}>
                  {/* <td>{product._id}</td> */}
                  <td>{product.name}</td>
                  <td>
                    {process.env.REACT_APP_CHINESE ? '¥' : '$'}
                    {product.price}
                  </td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <LinkContainer to={`/admin/product/${product._id}/edit`}>
                      <Button variant='light' className='btn-sm mx-2'>
                        <FaEdit />
                      </Button>
                    </LinkContainer>
                    <Button
                      variant='danger'
                      className='btn-sm'
                      onClick={() => deleteHandler(product._id)}
                    >
                      <FaTrash style={{ color: 'white' }} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginate pages={data.pages} page={data.page} isAdmin={true} />
        </>
      )}
    </>
  );
};

export default ProductListScreen;
