import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { useContext } from "react";
import { ChatContext } from "../ChatProvider";
import { UserListItem } from "../UserComponents/UserListItem";
import { UserBadgeItem } from "../UserComponents/UserBadgeItem";
import { CiAdd } from "icons-react/ci"
interface Props {
  fetchAgain: Boolean;
  setFetchAgain: (f: Boolean) => Boolean;
  fetchMessages: any
}
export const UpdateGroupChatModel = ({ fetchAgain, setFetchAgain, fetchMessages }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = useContext(ChatContext);

  const handleSearch = async (query: any) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`http://localhost:5000/api/users?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `http://localhost:5000/api/chats/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }
    setGroupChatName("");
  };

  const handleAddUser = async (user1: any) => {
    if (selectedChat.users.find((u: any) => u._id === user1._id)) {
      toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    console.log(selectedChat.groupAdmin === user._id)
    if (selectedChat.groupAdmin !== user._id) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      console.log("Success before axios")
      const { data } = await axios.put(
        `http://localhost:5000/api/chats/groupadd`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );
      console.log("Success after axios")

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
    window.location.reload()
  };

  const handleRemove = async (user1: any) => {
    console.log(selectedChat)
    console.log(user._id)
    console.log(user1._id)
    if (selectedChat.groupAdmin !== user._id && user1._id !== user._id) {
      toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `http://localhost:5000/api/chats/groupremove`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
    window.location.reload()
  };
  return (<>
    <Button
      aria-label="icon-button" display={{ base: "flex" }} backgroundColor={"#FC4445"} onClick={onOpen}>Edit chat settings</Button>

    <Modal onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          fontSize="35px"
          fontFamily="Work sans"
          display="flex"
          justifyContent="center"
        >
          {selectedChat.chatName}
        </ModalHeader>

        <ModalCloseButton />
        <ModalBody display="flex" flexDir="column" alignItems="center">
          <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
            {selectedChat.users.map((u: any) => (
              <UserBadgeItem
                key={u._id}
                user={u}
                admin={selectedChat.groupAdmin}
                handleFunction={() => handleRemove(u)}
              />
            ))}
          </Box>
          <FormControl display="flex">
            <Input
              placeholder="Chat Name"
              mb={3}
              value={groupChatName}
              onChange={(e) => setGroupChatName(e.target.value)}
            />
            <Button
              variant="solid"
              color={"white"}
              backgroundColor={"#FC4445"}
              ml={1}
              isLoading={renameloading}
              onClick={handleRename}
            >
              Update
            </Button>
          </FormControl>
          <FormControl>
            <Input
              placeholder="Add User to group"
              mb={1}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </FormControl>

          {loading ? (
            <Spinner size="lg" />
          ) : (
            searchResult?.map((user: any) => (
              <UserListItem
                key={user._id}
                user={user}
                handleFunction={() => handleAddUser(user)}
              />
            ))
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => handleRemove(user)} colorScheme="red">
            Leave Group
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </>)
}