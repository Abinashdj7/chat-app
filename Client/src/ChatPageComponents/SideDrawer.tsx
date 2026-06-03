import { useState } from "react";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useChatContext } from "../ChatProvider";
import { UserListItem } from "../UserComponents/UserListItem";
import { useUserSearch } from "../hooks/useUserSearch";
import { chatApi } from "../services/api";

export const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const { setSelectedChat, chats, setChats } = useChatContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { searchResult, loading, searchUsers } = useUserSearch();
  const toast = useToast();

  const handleSearch = () => {
    if (!search) {
      toast({ title: "Please enter a search term", status: "warning", duration: 5000, isClosable: true, position: "bottom" });
      return;
    }
    searchUsers(search);
  };

  const accessChat = async (userId: string) => {
    try {
      setLoadingChat(true);
      const { data } = await chatApi.accessChat(userId);
      if (Array.isArray(chats) && !chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      onClose();
    } catch {
      toast({ title: "Error fetching chat", status: "error", duration: 5000, isClosable: true, position: "bottom" });
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <Box sx={{ position: "sticky", top: 0, zIndex: 6, roundedBottom: "lg" }}>
      <Box sx={{ display: "flex", flexDirection: "row", backgroundImage: "https://img.freepik.com/free-vector/beautiful-decorative-soft-colorful-watercolor-texture-background_1055-14290.jpg?size=626&ext=jpg&ga=GA1.1.1687694167.1711584000&semt=ais" }}>
        <Box sx={{ pl: "20px", pt: "10px" }}>
          <Button onClick={onOpen} sx={{ backgroundColor: "#FC4445" }}>Search</Button>
        </Box>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent sx={{ backgroundColor: "#6CDAEE" }}>
          <DrawerHeader sx={{ backgroundColor: "#00f0b5" }}>Search users</DrawerHeader>
          <DrawerBody>
            <Box>
              <Input
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ backgroundColor: "#faf3dd" }}
              />
              <Button onClick={handleSearch} sx={{ backgroundColor: "#FC4445" }}>Go</Button>
              {loading ? (
                <Spinner ml="auto" display="flex" />
              ) : (
                searchResult.map((u: any) => (
                  <UserListItem key={u._id} user={u} handleFunction={() => accessChat(u._id)} />
                ))
              )}
              {loadingChat && <Spinner ml="auto" display="flex" />}
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
