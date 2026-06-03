import { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import { useChatContext } from "../ChatProvider";
import { postApi } from "../services/api";
import { PostInterface } from "./PostInterface";

export interface Post {
  _id: string;
  userId: string;
  title: string;
  description: string;
  username: string;
  image: string;
}

export const Posts = () => {
  const { user } = useChatContext();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await postApi.fetchPosts();
        setPosts(data);
      } catch {
        // silently skip — user sees empty list
      }
    };
    if (user) fetchPosts();
  }, [user]);

  return (
    <Box p={4}>
      {posts.map((post) => (
        <PostInterface key={post._id} post={post} />
      ))}
    </Box>
  );
};
