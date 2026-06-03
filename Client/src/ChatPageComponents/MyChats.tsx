import { useCallback, useEffect } from "react";
import { useChatContext } from "../ChatProvider";
import { Button, Stack, useToast, Text, Box, Flex, Spacer, Heading, Avatar } from "@chakra-ui/react";
import { GroupChatModel } from "../Messaging/GroupChatModel";
import { chatApi } from "../services/api";
import type { Chat } from "../types";

export const MyChats = ({ fetchAgain }: { fetchAgain: boolean }) => {
  const { setSelectedChat, chats, setChats } = useChatContext();
  const toast = useToast();

  const fetchChats = useCallback(async () => {
    try {
      const { data } = await chatApi.fetchChats();
      setChats(data as Chat[]);
    } catch {
      toast({ title: "Failed to load chats", status: "error", duration: 5000, isClosable: true, position: "bottom" });
    }
  }, [setChats, toast]);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    window.scrollTo(0, document.body.scrollHeight);
  };

  useEffect(() => {
    fetchChats();
  }, [fetchAgain, fetchChats]);

  return (
    <Box p={4} sx={{ backgroundColor: "#fcfaf9", backgroundImage: "https://img.freepik.com/free-vector/beautiful-decorative-soft-colorful-watercolor-texture-background_1055-14290.jpg?size=626&ext=jpg&ga=GA1.1.1687694167.1711584000&semt=ais" }}>
      <Flex align="center" pb={4}>
        <Heading size="lg" sx={{ backgroundColor: "#00f0b5", p: "10px", rounded: "lg", pl: "20px", pr: "20px" }}>
          My Chats
        </Heading>
        <Spacer />
        <GroupChatModel children={<Button colorScheme="blue" size="sm">New Group Chat</Button>} />
      </Flex>
      <Stack spacing={4}>
        {chats.length > 0 ? (
          chats.map((chat) => (
            <Box
              key={chat._id} bg="#6CDAEE" borderRadius="md" p={4}
              cursor="pointer" _hover={{ bg: "gray.100" }}
              onClick={() => handleChatSelect(chat)}
            >
              <Flex align="center">
                <Avatar size="md" name={chat.isGroupChat ? chat.chatName : chat.users[0].name} />
                <Box ml={3}>
                  <Text fontSize="lg" fontWeight="bold">
                    {chat.isGroupChat ? chat.chatName : chat.users[0].name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {chat.isGroupChat ? "Group Chat" : "Direct Message"}
                  </Text>
                </Box>
                <Spacer />
                <Text fontSize="sm">{new Date(chat.createdAt).toLocaleDateString()}</Text>
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
