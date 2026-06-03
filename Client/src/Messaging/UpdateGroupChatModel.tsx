import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Button, useDisclosure, FormControl, Input, useToast,
  Box, Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import { useChatContext } from "../ChatProvider";
import { UserListItem } from "../UserComponents/UserListItem";
import { UserBadgeItem } from "../UserComponents/UserBadgeItem";
import { useUserSearch } from "../hooks/useUserSearch";
import { chatApi } from "../services/api";
import type { User, Chat } from "../types";

interface Props {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
  fetchMessages: () => void;
}

export const UpdateGroupChatModel = ({ fetchAgain, setFetchAgain, fetchMessages }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);

  const toast = useToast();
  const { selectedChat, setSelectedChat, user } = useChatContext();
  const { searchResult, loading, searchUsers } = useUserSearch();

  // Only rendered when a group chat is open and the user is logged in
  if (!selectedChat || !user) return null;

  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      setRenameLoading(true);
      const { data } = await chatApi.renameChat(selectedChat._id, groupChatName);
      setSelectedChat(data as Chat);
      setFetchAgain(!fetchAgain);
      setGroupChatName("");
    } catch {
      toast({ title: "Rename failed", status: "error", duration: 5000, isClosable: true, position: "bottom" });
    } finally {
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (userToAdd: User) => {
    if (selectedChat.users.some((u: User) => u._id === userToAdd._id)) {
      toast({ title: "User already in group", status: "error", duration: 5000, isClosable: true, position: "bottom" });
      return;
    }
    if (selectedChat.groupAdmin !== user._id) {
      toast({ title: "Only admins can add members", status: "error", duration: 5000, isClosable: true, position: "bottom" });
      return;
    }
    try {
      const { data } = await chatApi.addToGroup(selectedChat._id, userToAdd._id);
      setSelectedChat(data as Chat);
      setFetchAgain(!fetchAgain);
    } catch {
      toast({ title: "Failed to add user", status: "error", duration: 5000, isClosable: true, position: "bottom" });
    }
  };

  const handleRemoveUser = async (userToRemove: User) => {
    if (selectedChat.groupAdmin !== user._id && userToRemove._id !== user._id) {
      toast({ title: "Only admins can remove members", status: "error", duration: 5000, isClosable: true, position: "bottom" });
      return;
    }
    try {
      const { data } = await chatApi.removeFromGroup(selectedChat._id, userToRemove._id);
      userToRemove._id === user._id ? setSelectedChat(null) : setSelectedChat(data as Chat);
      setFetchAgain(!fetchAgain);
      fetchMessages();
    } catch {
      toast({ title: "Failed to remove user", status: "error", duration: 5000, isClosable: true, position: "bottom" });
    }
  };

  return (
    <>
      <Button aria-label="Edit chat settings" display={{ base: "flex" }} backgroundColor="#FC4445" onClick={onOpen}>
        Edit chat settings
      </Button>
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="35px" fontFamily="Work sans" display="flex" justifyContent="center">
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((u: User) => (
                <UserBadgeItem key={u._id} user={u} admin={selectedChat.groupAdmin}
                  handleFunction={() => handleRemoveUser(u)} />
              ))}
            </Box>
            <FormControl display="flex">
              <Input placeholder="Chat Name" mb={3} value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)} />
              <Button variant="solid" color="white" backgroundColor="#FC4445" ml={1}
                isLoading={renameLoading} onClick={handleRename}>Update</Button>
            </FormControl>
            <FormControl>
              <Input placeholder="Add User to group" mb={1}
                onChange={(e) => searchUsers(e.target.value)} />
            </FormControl>
            {loading ? <Spinner size="lg" /> : (
              searchResult.map((u) => (
                <UserListItem key={u._id} user={u} handleFunction={() => handleAddUser(u)} />
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => handleRemoveUser(user)} colorScheme="red">Leave Group</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
