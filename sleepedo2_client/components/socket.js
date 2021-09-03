import { io } from "socket.io-client";
import { createContext } from 'react';
export const socket = io('http://192.168.1.181:5001', {
    withCredentials: true,
    transportOptions: {
        polling: {
            extraHeaders: {
                "my-custom-header": "abcd"
            }
        }
    }
});
export const SocketContext = createContext();

