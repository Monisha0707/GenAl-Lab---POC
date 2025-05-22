// store.js
import { configureStore } from "@reduxjs/toolkit";
import { alertSlice } from "./features/alertSlice";
import { dashboardSlice } from "./features/dashboardSlice";
import { navlinkSlice } from "./features/navlinkSlice";
import { userSlice } from "./features/userSlice";
import authReducer from "./features/authSlice"; // <-- add this

export default configureStore({
  reducer: {
    alerts: alertSlice.reducer,
    dashboardContext: dashboardSlice.reducer,
    navlinkContext: navlinkSlice.reducer,
    user: userSlice.reducer,
    auth: authReducer, // <-- add this line
  },
});
