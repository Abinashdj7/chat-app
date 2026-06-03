import { useEffect, useRef, useState } from "react";
import { useChatContext } from "../ChatProvider";
import { getSenderFull } from "../ChatLogic";
import { ProfileModel } from "../UserComponents/ProfileModel";
import { UpdateGroupChatModel } from "./UpdateGroupChatModel";
import { Spinner, useToast, Text, IconButton, Box, FormControl, Button, Textarea } from "@chakra-ui/react";
import { ScrollableChat } from "./ScrollableChat";
import Lottie from "lottie-react";
import animationData from "../Animation.json";
import { GoArrowLeft } from "icons-react/go";
import { useSocket } from "../hooks/useSocket";
import { messageApi } from "../services/api";

interface Props {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SingleChat = ({ fetchAgain, setFetchAgain }: Props) => {
  const toast = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const typingRef = useRef(false);

  const { user, selectedChat, setSelectedChat, setNotification } = useChatContext();
  const { socketRef, connected: socketConnected, isTyping } = useSocket(user);

  // Keep a ref to selectedChat so the message-received handler always sees the latest value
  // without needing to be re-registered on every chat change
  const selectedChatRef = useRef<any>(null);
  useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const { data } = await messageApi.fetchMessages(selectedChat._id);
      setMessages(data);
      socketRef.current?.emit("join chat", selectedChat._id);
    } catch {
      toast({ title: "Error loading messages", status: "warning", duration: 5000, isClosable: true, position: "bottom" });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    socketRef.current?.emit("stop typing", selectedChat._id);
    typingRef.current = false;
    const content = newMessage;
    setNewMessage("");
    try {
      const { data } = await messageApi.sendMessage(content, selectedChat._id);
      socketRef.current?.emit("new message", data);
      setMessages((prev) => [...prev, data]);
    } catch {
      toast({ title: "Error sending message", status: "error", duration: 5000, isClosable: true, position: "bottom" });
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  // Register message-received handler once when socket connects; use refs to avoid stale closures
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !socketConnected) return;
    const handleMessage = (newMsg: any) => {
      if (!selectedChatRef.current || selectedChatRef.current._id !== newMsg.chat._id) {
        setNotification((prev: any) =>
          Array.isArray(prev) && !prev.includes(newMsg) ? [newMsg, ...prev] : [newMsg]
        );
        setFetchAgain((prev) => !prev);
      } else {
        setMessages((prev) => [...prev, newMsg]);
      }
    };
    socket.on("message recieved", handleMessage);
    return () => { socket.off("message recieved", handleMessage); };
  }, [socketConnected]);

  const typingHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (!socketConnected || !selectedChat) return;
    if (!typingRef.current) {
      typingRef.current = true;
      socketRef.current?.emit("typing", selectedChat._id);
    }
    const lastTypingTime = Date.now();
    setTimeout(() => {
      if (Date.now() - lastTypingTime >= 3000 && typingRef.current) {
        socketRef.current?.emit("stop typing", selectedChat._id);
        typingRef.current = false;
      }
    }, 3000);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            backgroundColor="#00f0b5"
          >
            <IconButton
              aria-label="Go back"
              display={{ base: "flex", md: "none" }}
              icon={<GoArrowLeft />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {selectedChat.users[1].name === user.name
                  ? selectedChat.users[0].name
                  : selectedChat.users[1].name}
                <ProfileModel user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModel
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl id="message-input" isRequired mt={3}>
              {isTyping && (
                <Lottie
                  animationData={animationData}
                  loop
                  autoplay
                  style={{ marginBottom: 15, marginLeft: 0 }}
                />
              )}
              <Textarea
                variant="filled"
                placeholder="Enter a message.."
                value={newMessage}
                backgroundColor="#c8e9a0"
                onChange={typingHandler}
              />
              <div style={{ marginTop: "5px" }}>
                <Button onClick={sendMessage} backgroundColor="#FC4445">Send</Button>
              </div>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box sx={{ padding: 10, backgroundImage: "https://img.freepik.com/free-vector/beautiful-decorative-soft-colorful-watercolor-texture-background_1055-14290.jpg?size=626&ext=jpg&ga=GA1.1.1687694167.1711584000&semt=ais" }} />
      )}
    </>
  );
};
