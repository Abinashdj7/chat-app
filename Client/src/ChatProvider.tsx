import React, { createContext, useEffect, useState } from "react";

interface UserInfo {
    id: String;
    name: String;
    email: String;
    pic: String | null;
}

export interface ChatContextProps {
    selectedChat: any;
    setSelectedChat: React.Dispatch<React.SetStateAction<any>>;
    user: any;
    setUser: React.Dispatch<React.SetStateAction<any | null>>;
    notification: any;
    setNotification: React.Dispatch<React.SetStateAction<any>>;
    chats: any;
    setChats: React.Dispatch<React.SetStateAction<any>>;
    posts: any;
    setPosts: React.Dispatch<React.SetStateAction<any>>;
    selectedPost: any;
    setSelectedPost: React.Dispatch<React.SetStateAction<any>>;
}

export const ChatContext = createContext<ChatContextProps | null>(null);

export const useChatContext = () => {
    const ctx = React.useContext(ChatContext);
    if (!ctx) {
        throw new Error("useChatContext must be used within ChatProvider");
    }
    return ctx;
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [user, setUser] = useState<UserInfo | null>(null);
    const [notification, setNotification] = useState<any>(null);
    const [chats, setChats] = useState<any>(null);
    const [posts, setPosts] = useState<any>(null);
    const [selectedPost, setSelectedPost] = useState<any>(null);

    useEffect(() => {
        const userInfoString = localStorage.getItem("userInfo")
        if (userInfoString) {
            const userInfo = JSON.parse(userInfoString)
            setUser(userInfo)
        }
        else {
            return;
        }
    }, [])
    return (
        <ChatContext.Provider
            value={{
                selectedPost,
                setSelectedPost,
                selectedChat,
                setSelectedChat,
                chats,
                setChats,
                notification,
                setNotification,
                user,
                setUser,
                posts,
                setPosts,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}


