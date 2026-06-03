import ScrollableFeed from "react-scrollable-feed";
import { Box } from "@chakra-ui/react";

interface Props {
  comments: any[];
}

export const Comments = ({ comments }: Props) => {
  return (
    <ScrollableFeed>
      <Box mt={4} px={4}>
        {comments.map((c: any, index: number) => (
          <Box
            key={index}
            backgroundColor="#faf3dd"
            p={3}
            borderRadius="md"
            boxShadow="md"
            mb={2}
          >
            <Box fontWeight="bold">{c.sender?.name ?? c.user}</Box>
            <Box>{c.content}</Box>
          </Box>
        ))}
      </Box>
    </ScrollableFeed>
  );
};
