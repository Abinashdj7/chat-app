import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../ChatProvider";
import { getSender, getSenderFull } from "../ChatLogic";
import { ProfileModel } from "../UserComponents/ProfileModel";
import { UpdateGroupChatModel } from "./UpdateGroupChatModel";
import { Spinner, useToast, Text, IconButton, Box, FormControl, Input, Button, Textarea } from "@chakra-ui/react";
import axios, { AxiosRequestConfig } from "axios";
import { ScrollableChat } from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "lottie-react";
import animationData from "../Animation.json";
import { GoArrowLeft } from "icons-react/go";

const ENDPOINT = 'http://localhost:5000';
var socket: any;
var selectedChatCompare: any;

interface Props {
  fetchAgain: boolean;
  setFetchAgain: (f: boolean) => boolean;
}

export const SingleChat = ({ fetchAgain, setFetchAgain }: Props) => {
  const toast = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const { user, selectedChat, setSelectedChat, notification, setNotification } = useContext(ChatContext);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) {
      return;
    }
    try {
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      setLoading(true);
      const { data } = await axios.get(`http://localhost:5000/api/messages/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (err) {
      toast({
        title: "Error occurred",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom"
      });
    }
  };

  const sendMessage = async (event: any) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
    }
    try {
      const config: AxiosRequestConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        }
      };
      setNewMessage("");
      const { data } = await axios.post("http://localhost:5000/api/messages", {
        content: newMessage,
        chatId: selectedChat
      }, config);
      socket.emit("new message", data);
      setMessages([...messages, data]);
    } catch (err) {
      toast({
        title: "Error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom"
      });
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessageReceived: any) => {
      if (!selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id) {
        if (Array.isArray(notification) && !notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      }
      else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  const typingHandler = async (e: any) => {
    setNewMessage(e.target.value);
    if (!socketConnected) {
      return;
    }
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timeLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timeLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timeLength);
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
            backgroundColor={"#00f0b5"}
          >
            <IconButton
              aria-label="Icon Button"
              display={{ base: "flex", md: "none" }}
              icon={<GoArrowLeft />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {selectedChat.users[1].name === user.name ? selectedChat.users[0].name : selectedChat.users[1].name}
                  <ProfileModel
                    user={getSenderFull(user, selectedChat.users)}
                  />
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
              ))}
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
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              id="first-name"
              isRequired
              mt={3}
            >
              {isTyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Textarea
                variant="filled"
                placeholder="Enter a message.."
                value={newMessage}
                backgroundColor={"#c8e9a0"}
                onChange={typingHandler}
              />
              <div style={{marginTop:"5px"}}>
              <Button onClick={sendMessage} backgroundColor={"#FC4445"}>Send</Button>
              </div>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box sx={{padding:10,backgroundImage:"https://img.freepik.com/free-vector/beautiful-decorative-soft-colorful-watercolor-texture-background_1055-14290.jpg?size=626&ext=jpg&ga=GA1.1.1687694167.1711584000&semt=ais"}}>
        </Box>
      )}
    </>
  );
};
