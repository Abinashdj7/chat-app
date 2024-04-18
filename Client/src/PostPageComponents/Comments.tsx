import { useContext } from "react";
import { ChatContext } from "../ChatProvider";
import ScrollableFeed from "react-scrollable-feed";
import { Box } from "@chakra-ui/react";

interface Props {
  comments: any;
}

export const Comments = ({ comments }: Props) => {
  const { user } = useContext(ChatContext);

  return (
    <ScrollableFeed>
      <Box mt={4} px={4}>
        {comments &&
          comments.map((c: any, index: number) => (
            <Box
              key={index}
              backgroundColor={"#faf3dd"}
              p={3}
              borderRadius="md"
              boxShadow="md"
              mb={2}
            >
              <Box fontWeight="bold">{c.user}</Box>
              <Box>{c.content}</Box>
            </Box>
          ))}
      </Box>
    </ScrollableFeed>
  );
};
