import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: localStorage.getItem("email") || null,
  token: localStorage.getItem("token") || null,
};

const userSlice = createSlice({
 name: "user",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.loggedIn = true;
    },
    logout: (state) => {
      state.email = null;
      state.token = null;
      state.loggedIn = false;
    },
  },
});

export const { loginSuccess, logout } = userSlice.actions;
export default userSlice.reducer;
