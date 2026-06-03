import {
  useDisclosure, Button, ModalBody, ModalOverlay, ModalCloseButton,
  ModalContent, Modal, ModalHeader, ModalFooter, useToast,
  FormControl, Input, Box, Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import { useChatContext } from "../ChatProvider";
import { UserListItem } from "../UserComponents/UserListItem";
import { UserBadgeItem } from "../UserComponents/UserBadgeItem";
import { useUserSearch } from "../hooks/useUserSearch";
import { chatApi } from "../services/api";
import type { User, Chat } from "../types";

interface GroupChatModelProps {
  children?: React.ReactNode;
}

export const GroupChatModel = ({ children }: GroupChatModelProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const toast = useToast();
  const { chats, setChats } = useChatContext();
  const { searchResult, loading, searchUsers } = useUserSearch();

  const handleAddUser = (userToAdd: User) => {
    if (selectedUsers.some((u) => u._id === userToAdd._id)) {
      toast({ title: "User already added", status: "warning", duration: 5000, isClosable: true, position: "bottom" });
      return;
    }
    setSelectedUsers((prev) => [...prev, userToAdd]);
  };

  const handleRemoveUser = (userToRemove: User) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== userToRemove._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      toast({ title: "Please fill all fields", status: "warning", duration: 5000, isClosable: true, position: "bottom" });
      return;
    }
    try {
      const { data } = await chatApi.createGroupChat(groupChatName, selectedUsers.map((u) => u._id));
      setChats([data as Chat, ...chats]);
      onClose();
      toast({ title: "Group chat created", status: "success", duration: 5000, isClosable: true, position: "bottom" });
    } catch {
      toast({ title: "Failed to create group chat", status: "error", duration: 5000, isClosable: true, position: "bottom" });
    }
  };

  return (
    <>
      {children ? <div onClick={onOpen}>{children}</div> : (
        <Button onClick={onOpen} style={{ backgroundColor: "#00f0b5" }}>Create Chat</Button>
      )}
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="2xl" fontFamily="Work Sans" textAlign="center" backgroundColor="#00f0b5">
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input placeholder="Chat Name" mb={3} onChange={(e) => setGroupChatName(e.target.value)} />
            </FormControl>
            <FormControl>
              <Input placeholder="Add Users e.g. John, Piyush, Jane" mb={1}
                onChange={(e) => searchUsers(e.target.value)} />
            </FormControl>
            <Box w="100%" display="flex" flexWrap="wrap">
              {selectedUsers.map((u) => (
                <UserBadgeItem key={u._id} user={u} handleFunction={() => handleRemoveUser(u)} admin={undefined} />
              ))}
            </Box>
            {loading ? <Spinner size="lg" /> : (
              searchResult.slice(0, 4).map((u) => (
                <UserListItem key={u._id} user={u} handleFunction={() => handleAddUser(u)} />
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} backgroundColor="#FC4445">Create Chat</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
