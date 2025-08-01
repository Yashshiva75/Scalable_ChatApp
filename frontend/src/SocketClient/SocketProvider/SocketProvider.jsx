import { useEffect,useState } from "react";
import { socketContext } from "../SocketContext/SocketContext";
import {io} from 'socket.io-client'
export default function SocketProvider({children}) {
     const [socket,setSocket] = useState(null)
     const BASE_API = import.meta.env.VITE_REACT_APP_API_URL;

     useEffect(()=>{
      const newSocket = io(`${BASE_API}`,{
        withCredentials:true
      })

      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
     },[])

     return(
        <socketContext.Provider value={socket}>
            {children}
        </socketContext.Provider> 
     )
}