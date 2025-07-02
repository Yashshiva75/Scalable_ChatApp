import { useEffect,useState } from "react";
import { socketContext } from "../SocketContext/SocketContext";
import {io} from 'socket.io-client'
export default function SocketProvider({children}) {
     const [socket,setSocket] = useState(null)

     useEffect(()=>{
      const newSocket = io("http://localhost:5000",{
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