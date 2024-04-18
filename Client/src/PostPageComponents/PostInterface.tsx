import { useContext, useEffect, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";
import {
  Box,
  Button,
  FormControl,
  Input,
  Spinner,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { ChatContext } from "../ChatProvider";
import { Comments } from "./Comments";
import { Post as IPost } from "./Posts";

interface Props {
  post: IPost;
}

export const PostInterface = ({ post }: Props) => {
  const { user } = useContext(ChatContext);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getComments();
    getLike();
  }, []);

  const getComments = async () => {
    try {
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:5000/api/comments/${post._id}`,
        config
      );
      setComments(data);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const makeComment = async () => {
    try {
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setNewComment("");
      const { data } = await axios.post(
        "http://localhost:5000/api/comments",
        {
          content: newComment,
          postId: post._id,
        },
        config
      );
      setComments([...comments, data]);
    } catch (err) {
      console.log(err);
    }
  };

  const makeLike = async () => {
    try {
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "http://localhost:5000/api/likes",
        {
          postId: post._id,
          userId: user._id,
        },
        config
      );
      setLikes((prev) => [...prev, { userId: user?._id, likeId: data._id }]);
    } catch (err) {
      console.log(err);
    }
  };

  const getLike = async () => {
    try {
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `http://localhost:5000/api/likes/${post._id}`,
        config
      );
      if (Array.isArray(data)) {
        setLikes(data.map((d) => ({ userId: d.userId, likeId: d._id })));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteLike = async () => {
    try {
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.delete(
        `http://localhost:5000/api/likes/${post._id}/${user._id}`,
        config
      );
      setLikes((prevLikes) =>
        prevLikes.filter((like: any) => like.userId !== user?._id)
      );
    } catch (err) {
      console.log(err);
    }
  };
  

  const hasLiked =
    Array.isArray(likes) && likes?.find((like: any) => like.userId === user?._id);

  return (
    <Box borderWidth="1px" borderRadius="lg" p="4" background ="#c8d5b9" mb={9}>
      <Box sx={{display:"inline-block"}} pl={4} pr={4} pt={2} pb={2} fontSize="xl" fontWeight="bold" mb="2" backgroundColor="#68b0ab" rounded={"md"}>
        {post.title}
      </Box>
      <Text>{post.description}</Text>
      {post.image && <Box mt="4"><img src={post.image} alt={post.title} height="200" width="200"/></Box>}
      <Text mt="2" fontWeight="bold">
        {post.username}
      </Text>
      <Button mt="2" backgroundColor="#68b0ab" onClick={hasLiked ? deleteLike : makeLike}>
        {hasLiked ? "Unlike" : "Like"}
      </Button>
      <Text mt="2">{Array.isArray(likes) ? likes.length : 0} Likes</Text>
      <Box mt="4">
        {loading ? (
          <Spinner size="lg" />
        ) : (
          <Comments comments={comments} />
        )}
      </Box>
      <FormControl mt="4">
        <Textarea
          value={newComment}
          backgroundColor={"#faf3dd"}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment"
        />
        <Button mt="2" onClick={makeComment} backgroundColor="#68b0ab">
          Comment
        </Button>
      </FormControl>
    </Box>
  );
};
