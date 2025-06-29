import {configureStore} from '@reduxjs/toolkit'
import slice from './userSlice'

export const store = configureStore({
    reducer:{
        user:slice
    }
})