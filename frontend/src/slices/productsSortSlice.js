import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  productsSort: localStorage.getItem('productsSort')
    ? JSON.parse(localStorage.getItem('productsSort'))
    : null,
};
const productsSortSlice = createSlice({
  name: 'productsSort',
  initialState,
  reducers: {
    setProductsSort: (state, action) => {
      state.productsSort = action.payload;
      localStorage.setItem('productsSort', JSON.stringify(action.payload));
    },
  },
});

export const { setProductsSort } = productsSortSlice.actions;

export default productsSortSlice.reducer;
