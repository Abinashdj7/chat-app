import { useContext, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { AiFillBulb } from "icons-react/ai";
import { ChatContext } from "../ChatProvider";
import { ProfileModel } from "../UserComponents/ProfileModel";
import { UserListItem } from "../UserComponents/UserListItem";
import { useNavigate } from "react-router-dom";

export const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const { user, setSelectedChat, chats, setChats } = useContext(ChatContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    try {
      setLoading(true);
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`http://localhost:5000/api/users?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (err) {
      toast({
        title: "Error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const accessChat = async (userId: String) => {
    try {
      setLoadingChat(true);
      const config: AxiosRequestConfig = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post("http://localhost:5000/api/chats", { userId }, config);
      if (Array.isArray(chats) && !chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (err) {
      toast({
        title: "Error fetching chat",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <Box sx={{ position: "sticky", top: 0, zIndex: 6, roundedBottom: "lg" }}>
      <Box sx={{ display: "flex", flexDirection: "row" ,backgroundImage:"https://img.freepik.com/free-vector/beautiful-decorative-soft-colorful-watercolor-texture-background_1055-14290.jpg?size=626&ext=jpg&ga=GA1.1.1687694167.1711584000&semt=ais" }}>
        <Box sx={{ pl: "20px", pt: "10px" }}><Button onClick={onOpen} sx={{ backgroundColor: "#FC4445" }}>Search</Button></Box>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent sx={{ backgroundColor: "#6CDAEE" }}>
          <DrawerHeader sx={{ backgroundColor: "#00f0b5" }}>Search users</DrawerHeader>
          <DrawerBody>
            <Box>
              <Input type="text" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} sx={{backgroundColor:"#faf3dd"}}/>
              <Button onClick={handleSearch} sx={{ backgroundColor: "#FC4445" }}>Go</Button>
              {loading ? null : (
                searchResult?.map((u: any) => (
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
