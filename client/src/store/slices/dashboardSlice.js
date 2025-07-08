import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: [],
  loading: false,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setData(state, action) {
      state.data = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setData, setLoading } = dashboardSlice.actions;
export default dashboardSlice.reducer; 