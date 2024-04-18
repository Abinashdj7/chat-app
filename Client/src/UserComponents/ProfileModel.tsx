import { MenuButton, MenuList, MenuItem, Avatar } from "@chakra-ui/react";
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalCloseButton
    , Button, useDisclosure, IconButton, Text, Image, ModalBody,
    Menu
}
    from "@chakra-ui/react";

interface Props {
    children: any;
    user: any;
}
export const ProfileModel = ({ user }: Props) => {
    return (<>
        <Menu>
            <MenuButton as={Avatar} name={user.name} src={user.pic} cursor="pointer" size="lg">
            </MenuButton>
            <MenuList sx={{backgroundColor:"#faf3dd"}}>
                <MenuItem sx={{backgroundColor:"#faf3dd"}}>Name - {user.name}</MenuItem>
                <MenuItem sx={{backgroundColor:"#faf3dd"}}>Email - {user.email}</MenuItem>
            </MenuList>
        </Menu>
    </>)
}