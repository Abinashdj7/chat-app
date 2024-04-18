import { Box, Button, Menu, MenuButton, MenuDivider, MenuItem, MenuList, useDisclosure } from "@chakra-ui/react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../ChatProvider";
import { ProfileModel } from "../UserComponents/ProfileModel";

interface Props {
    mode: boolean;
    changeMode: () => void;
}
export const NavBar = ({ mode, changeMode }: Props) => {
    const navigate = useNavigate();
    const { notification, setSelectedChat, setNotification, user } = useContext(ChatContext)
    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        navigate("/");
    };
    return (<>
        <header style={{ zIndex: 7, position: "sticky", top: 0, padding: "1rem", backgroundColor: "#F7CAD0", paddingLeft: "20px", backgroundImage: "https://static.vecteezy.com/system/resources/previews/024/274/749/non_2x/beautiful-landscape-in-pink-asian-style-long-hills-and-mountains-scenery-background-design-illustration-suitable-for-landing-pages-web-wall-painting-and-posters-vector.jpg" }}>
            <Box sx={{ display: "flex", flexDirection: "row" }}>
                <Box>
                    <Button
                        sx={{
                            padding: "0.5rem 1rem",
                            border: "none",
                            backgroundColor: "#FC4445",
                            borderRadius: "0.25rem",
                            cursor: "pointer",
                        }}
                        onClick={changeMode}
                    >
                        {mode ? "Chats" : "Posts"}
                    </Button>
                </Box>
                <Box sx={{ pl: 100 }}>
                    <Button onClick={logoutHandler} variant="solid" sx={{ backgroundColor: "#FC4445" }}>
                        Log out
                    </Button>
                </Box>
                <Box sx={{ pl: 100 }}><Menu>
                    <MenuButton as={Button} variant="solid" sx={{ backgroundColor: "#FC4445" }}>Notification</MenuButton>
                    <MenuList>
                        {notification?.length ? (
                            notification.map((n) => (
                                <MenuItem key={n._id} onClick={() => {
                                    setSelectedChat(n.chat);
                                    setNotification(notification.filter((notif) => notif !== n));
                                }}>
                                    {n.chat.isGroupChat ? `New message in ${n.chat.chatName}` : `New message from ${"GetSender"}`}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem>No new message</MenuItem>
                        )}
                    </MenuList>
                </Menu></Box>
                <Box>
                    <Menu>
                        <Box sx={{ pl: 900}}>
                            <ProfileModel user={user} children={undefined} />
                        </Box>
                        <MenuDivider />
                    </Menu>
                </Box>
            </Box>
        </header>
    </>)
}