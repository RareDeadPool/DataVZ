import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  files: [], // Each file: { name, data, sheets, uploadedAt, ... }
};

const uploadedFilesSlice = createSlice({
  name: 'uploadedFiles',
  initialState,
  reducers: {
    addUploadedFile(state, action) {
      state.files.push(action.payload);
    },
    setUploadedFiles(state, action) {
      state.files = action.payload;
    },
    removeUploadedFile(state, action) {
      state.files = state.files.filter(f => f.name !== action.payload);
    },
    clearUploadedFiles(state) {
      state.files = [];
    },
  },
});

export const { addUploadedFile, setUploadedFiles, removeUploadedFile, clearUploadedFiles } = uploadedFilesSlice.actions;
export default uploadedFilesSlice.reducer; 