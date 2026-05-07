import { useEffect } from "react";
import { useChatContext } from "../ChatProvider";
import { Button, Stack, useToast, Text, Box, Flex, Spacer, Heading, Avatar } from "@chakra-ui/react";
import { GroupChatModel } from "../Messaging/GroupChatModel";
import axios from "axios";

export const MyChats = ({ fetchAgain }: { fetchAgain: boolean }) => {
  const { user, setSelectedChat, chats, setChats } = useChatContext();
  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        "http://localhost:5050/api/chats",
        config
      );
      setChats(data);
    } catch (err) {
      toast({
        title: "Failed to load chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  const chatScroll = (chat: any) => {
    setSelectedChat(chat)
    let maxY = document.body.scrollHeight

    window.scrollTo(0, maxY);
  }

  useEffect(() => {
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box p={4} sx={{ backgroundColor: "#fcfaf9", backgroundImage: "https://img.freepik.com/free-vector/beautiful-decorative-soft-colorful-watercolor-texture-background_1055-14290.jpg?size=626&ext=jpg&ga=GA1.1.1687694167.1711584000&semt=ais" }}>
      <Flex align="center" pb={4}>
        <Heading size="lg" pr={2} sx={{ backgroundColor: "#00f0b5", p: "10px", rounded: "lg", pl: "20px", pr: "20px" }}>My Chats</Heading>
        <Spacer />
        <GroupChatModel children={<Button colorScheme="blue" size="sm">New Group Chat</Button>} />
      </Flex>
      <Stack spacing={4}>
        {chats && chats.length > 0 ? (
          chats.map((chat: any) => (
            <Box
              key={chat._id}
              bg="#6CDAEE"
              borderRadius="md"
              p={4}
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={() => chatScroll(chat)}
            >
              <Flex align="center">
                <Avatar size="md" name={chat.isGroupChat ? chat.chatName : chat.users[0].name} />
                <Box ml={3}>
                  <Text fontSize="lg" fontWeight="bold">{chat.isGroupChat ? chat.chatName : chat.users[0].name}</Text>
                  <Text fontSize="sm" color="gray.500">{chat.isGroupChat ? "Group Chat" : "Direct Message"}</Text>
                </Box>
                <Spacer />
                <Box>
                  <Text fontSize="sm">{new Date(chat.createdAt).toLocaleDateString()}</Text>
                </Box>
              </Flex>
            </Box>
          ))
        ) : (
          <Text fontSize="lg" color="gray.500">No chats available</Text>
        )}
      </Stack>
    </Box>
  );
};

