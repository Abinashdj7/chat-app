import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
interface UserInfo{
    id:String,
    name:String,
    email:String,
    pic:String | null
}
interface ChatContextProps{
    selectedChat:any,
    setSelectedChat:React.Dispatch<React.SetStateAction<any>>,
    user:any,
    setUser:React.Dispatch<React.SetStateAction<any | null>>,
    notification:any,
    setNotification:React.Dispatch<React.SetStateAction<any>>,
    chats:any,
    setChats:React.Dispatch<React.SetStateAction<any>>,
    posts:any,
    setPosts:React.Dispatch<React.SetStateAction<any>>,
    selectedPost:any,
    setSelectedPost:React.Dispatch<React.SetStateAction<any>>
}
export const ChatContext=createContext<ChatContextProps | undefined>(undefined)
export const ChatProvider=({children}) => {
    const[selectedChat,setSelectedChat]=useState<any>()
    const[user,setUser]=useState<UserInfo | null>()
    const[notification,setNotification]=useState<any>()
    const[chats,setChats]=useState<any>()
    const[posts,setPosts]=useState<any>()
    const[selectedPost,setSelectedPost]=useState<any>()
    useEffect(() => {
        const userInfoString=localStorage.getItem("userInfo")
        if(userInfoString){
            const userInfo=JSON.parse(userInfoString)
            setUser(userInfo)
        }
        else{
            return;
        }
    },[])
    return(<>
    <ChatContext.Provider value={{selectedPost,setSelectedPost,selectedChat,setSelectedChat,chats,setChats,notification,setNotification,user,setUser,posts,setPosts}}>
        {children}
    </ChatContext.Provider>
    </>)
}
