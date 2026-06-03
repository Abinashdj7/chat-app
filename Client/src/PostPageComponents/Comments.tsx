import ScrollableFeed from "react-scrollable-feed";
import { Box } from "@chakra-ui/react";
import type { Comment } from "../types";

interface Props {
  comments: Comment[];
}

export const Comments = ({ comments }: Props) => (
  <ScrollableFeed>
    <Box mt={4} px={4}>
      {comments.map((c, index) => (
        <Box key={index} backgroundColor="#faf3dd" p={3} borderRadius="md" boxShadow="md" mb={2}>
          <Box fontWeight="bold">{c.sender?.name}</Box>
          <Box>{c.content}</Box>
        </Box>
      ))}
    </Box>
  </ScrollableFeed>
);
