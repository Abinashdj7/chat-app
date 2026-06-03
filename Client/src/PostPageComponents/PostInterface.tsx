import { useState } from "react";
import { Box, Button, FormControl, Spinner, Text, Textarea } from "@chakra-ui/react";
import { useChatContext } from "../ChatProvider";
import { Comments } from "./Comments";
import { Post } from "./Posts";
import { usePostActions } from "../hooks/usePostActions";

interface Props {
  post: Post;
}

export const PostInterface = ({ post }: Props) => {
  const { user } = useChatContext();
  const [newComment, setNewComment] = useState("");
  const { likes, comments, loading, hasLiked, addLike, removeLike, addComment } =
    usePostActions(post._id, user?._id ?? '');

  const handleComment = async () => {
    if (!newComment.trim()) return;
    const content = newComment;
    setNewComment("");
    await addComment(content);
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p="4" background="#c8d5b9" mb={9}>
      <Box
        sx={{ display: "inline-block" }}
        pl={4} pr={4} pt={2} pb={2}
        fontSize="xl"
        fontWeight="bold"
        mb="2"
        backgroundColor="#68b0ab"
        rounded="md"
      >
        {post.title}
      </Box>
      <Text>{post.description}</Text>
      {post.image && (
        <Box mt="4">
          <img src={post.image} alt={post.title} height="200" width="200" />
        </Box>
      )}
      <Text mt="2" fontWeight="bold">{post.username}</Text>
      <Button mt="2" backgroundColor="#68b0ab" onClick={hasLiked ? removeLike : addLike}>
        {hasLiked ? "Unlike" : "Like"}
      </Button>
      <Text mt="2">{likes.length} Likes</Text>
      <Box mt="4">
        {loading ? <Spinner size="lg" /> : <Comments comments={comments} />}
      </Box>
      <FormControl mt="4">
        <Textarea
          value={newComment}
          backgroundColor="#faf3dd"
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment"
        />
        <Button mt="2" onClick={handleComment} backgroundColor="#68b0ab">Comment</Button>
      </FormControl>
    </Box>
  );
};
