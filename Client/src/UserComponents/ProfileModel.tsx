import { MenuButton, MenuList, MenuItem, Avatar, Menu } from "@chakra-ui/react";

interface Props {
    user: any;
    children?: any;
}
export const ProfileModel = ({ user }: Props) => {
    return (<>
        <Menu>
            <MenuButton as={Avatar} name={user.name} src={user.pic} cursor="pointer" size="lg">
            </MenuButton>
            <MenuList sx={{ backgroundColor: "#faf3dd" }}>
                <MenuItem sx={{ backgroundColor: "#faf3dd" }}>Name - {user.name}</MenuItem>
                <MenuItem sx={{ backgroundColor: "#faf3dd" }}>Email - {user.email}</MenuItem>
            </MenuList>
        </Menu>
    </>)
}
