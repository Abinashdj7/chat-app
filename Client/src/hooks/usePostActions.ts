import { useState, useEffect } from "react";
import { likeApi, commentApi } from "../services/api";
import type { Like, Comment } from "../types";

export function usePostActions(postId: string, userId: string) {
  const [likes, setLikes] = useState<Like[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [likeRes, commentRes] = await Promise.all([
          likeApi.getLikes(postId),
          commentApi.getComments(postId),
        ]);
        setLikes(likeRes.data as Like[]);
        setComments(commentRes.data as Comment[]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [postId]);

  const addLike = async () => {
    const { data } = await likeApi.addLike(postId, userId);
    setLikes((prev) => [...prev, { postId, userId, likeId: (data as Like)._id }]);
  };

  const removeLike = async () => {
    await likeApi.deleteLike(postId, userId);
    setLikes((prev) => prev.filter((l) => l.userId !== userId));
  };

  const addComment = async (content: string) => {
    const { data } = await commentApi.makeComment(content, postId);
    setComments((prev) => [...prev, data as Comment]);
  };

  const hasLiked = likes.some((l) => l.userId === userId);

  return { likes, comments, loading, hasLiked, addLike, removeLike, addComment };
}
