import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: null,
  token: null,
  userID: null, // ✅ Added
  loggedIn: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.userID = action.payload.userID;  // ✅ Save it
      state.loggedIn = true;
    },
    logout: (state) => {
      state.email = null;
      state.token = null;
      state.userID = null; // ✅ Clear on logout
      state.loggedIn = false;
    },
  },
});

export const { loginSuccess, logout } = userSlice.actions;
export default userSlice.reducer;
