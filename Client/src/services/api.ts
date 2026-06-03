import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5050";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("userInfo");
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/api/users/login", { email, password }),
  register: (name: string, email: string, password: string, pic: string | null) =>
    api.post("/api/users", { name, email, password, pic }),
  searchUsers: (query: string) =>
    api.get<any[]>(`/api/users?search=${encodeURIComponent(query)}`),
};

export const chatApi = {
  fetchChats: () => api.get("/api/chats"),
  accessChat: (userId: string) => api.post("/api/chats", { userId }),
  createGroupChat: (name: string, userIds: string[]) =>
    api.post("/api/chats/group", { name, users: JSON.stringify(userIds) }),
  renameChat: (chatId: string, chatName: string) =>
    api.put("/api/chats/rename", { chatId, chatName }),
  addToGroup: (chatId: string, userId: string) =>
    api.put("/api/chats/groupadd", { chatId, userId }),
  removeFromGroup: (chatId: string, userId: string) =>
    api.put("/api/chats/groupremove", { chatId, userId }),
};

export const messageApi = {
  fetchMessages: (chatId: string) => api.get(`/api/messages/${chatId}`),
  sendMessage: (content: string, chatId: string) =>
    api.post("/api/messages", { content, chatId }),
};

export const postApi = {
  fetchPosts: () => api.get("/api/posts"),
  createPost: (payload: {
    title: string;
    description: string;
    image: string;
    username: string;
    userId: string;
  }) => api.post("/api/posts", payload),
};

export const likeApi = {
  getLikes: (postId: string) => api.get(`/api/likes/${postId}`),
  addLike: (postId: string, userId: string) =>
    api.post("/api/likes", { postId, userId }),
  deleteLike: (postId: string, userId: string) =>
    api.delete(`/api/likes/${postId}/${userId}`),
};

export const commentApi = {
  getComments: (postId: string) => api.get(`/api/comments/${postId}`),
  makeComment: (content: string, postId: string) =>
    api.post("/api/comments", { content, postId }),
};

export default api;
