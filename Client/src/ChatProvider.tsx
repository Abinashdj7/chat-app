import React, { createContext, useEffect, useState } from "react";
import type { User, Chat, Post, Message } from "./types";

export interface ChatContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  selectedChat: Chat | null;
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  notification: Message[];
  setNotification: React.Dispatch<React.SetStateAction<Message[]>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  selectedPost: Post | null;
  setSelectedPost: React.Dispatch<React.SetStateAction<Post | null>>;
}

export const ChatContext = createContext<ChatContextProps | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useChatContext = () => {
  const ctx = React.useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [notification, setNotification] = useState<Message[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) setUser(JSON.parse(stored) as User);
  }, []);

  return (
    <ChatContext.Provider value={{
      user, setUser,
      selectedChat, setSelectedChat,
      chats, setChats,
      notification, setNotification,
      posts, setPosts,
      selectedPost, setSelectedPost,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
