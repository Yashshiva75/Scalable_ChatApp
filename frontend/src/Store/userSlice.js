import { createSlice } from "@reduxjs/toolkit";

const isAuthFromStorage = sessionStorage.getItem("token") ? true : false;
const userFromStorage = JSON.parse(sessionStorage.getItem("user"));

const initialState = {
  userData: userFromStorage || null,
  token: sessionStorage.getItem("token") || null,
  isAuthenticated: isAuthFromStorage,
};


const userSlice = createSlice({
    name:'user',
    initialState,
    reducers:{
        setUser(state,action){
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        logOutUser(state,action){
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
        }
    }
})

export const {setUser,logOutUser} = userSlice.actions;
export default userSlice.reducer;
