import { ENDPOINTS } from "./endpoint";
import apiClient from "./appClient";

export const authApi = {
    login : async(credentials)=>{
        const response = await apiClient.post(ENDPOINTS.LOGIN,credentials);

    if (response.token) {
      sessionStorage.setItem('token', response.token);
    }
    return response;

    },

    register : async(credentials)=>{
        try{
            const response = await apiClient.post(ENDPOINTS.REGISTER,credentials)
        return response
      }catch(error){
        console.log('Err',error)
      }
    },

    logout : async(credentials)=>{
        const response = await apiClient.post(ENDPOINTS.LOGOUT)
        sessionStorage.removeItem('token')
        return response
    }

}