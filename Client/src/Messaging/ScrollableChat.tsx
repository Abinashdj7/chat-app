import { useContext } from "react";
import { ChatContext } from "../ChatProvider";
import { Avatar, Tooltip, Box } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import { isLatestMessage, isSameSender, isSameSenderMargin, isSameUser } from "../ChatLogic";

interface Props {
  messages: any;
}

export const ScrollableChat = ({ messages }: Props) => {
  const { user } = useContext(ChatContext);

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m: any, i: any) => (
          <Box key={m._id} display="flex">
            {(isSameSender(messages, m, i, user._id) ||
              isLatestMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}
            <Box
              backgroundColor={m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"}
              marginLeft={isSameSenderMargin(messages, m, i, user._id)}
              marginTop={isSameUser(messages, m, i) ? 3 : 10}
              borderRadius="20px"
              padding="5px 15px"
              maxWidth="75%"
            >
              {m.content}
            </Box>
          </Box>
        ))}
    </ScrollableFeed>
  );
};
