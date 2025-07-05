
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { ApiProduct } from '@/lib/types';

interface ProductState {
  selectedProduct: ApiProduct | null;
}

const initialState: ProductState = {
  selectedProduct: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<ApiProduct>) => {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
});

export const { setSelectedProduct, clearSelectedProduct } = productSlice.actions;

export const selectCurrentProduct = (state: RootState) => state.product.selectedProduct;

export default productSlice.reducer;
