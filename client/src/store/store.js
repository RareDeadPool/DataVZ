import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import uploadedFilesReducer from './slices/uploadedFilesSlice';

import projectsReducer from './slices/projectsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    uploadedFiles: uploadedFilesReducer,

    projects: projectsReducer,
  },
});

export default store; 