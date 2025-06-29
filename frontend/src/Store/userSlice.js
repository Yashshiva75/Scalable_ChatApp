import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user:null,
    token:null,
    isAuthenticated:false
}

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
