export interface User {
  _id: string;
  name: string;
  email: string;
  pic?: string;
  isAdmin?: boolean;
  token?: string;
}

export interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: User[];
  latestMessage?: Message;
  groupAdmin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  title: string;
  description: string;
  image: string;
  userId: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  sender: User;
  content: string;
  post: string;
}

export interface Like {
  _id?: string;
  postId?: string;
  userId: string;
  likeId?: string;
}
