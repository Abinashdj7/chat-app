import { MenuButton, MenuList, MenuItem, Avatar, Menu } from "@chakra-ui/react";
import type { User } from "../types";

interface Props {
  user: User;
}

export const ProfileModel = ({ user }: Props) => (
  <Menu>
    <MenuButton as={Avatar} name={user.name} src={user.pic} cursor="pointer" size="lg" />
    <MenuList sx={{ backgroundColor: "#faf3dd" }}>
      <MenuItem sx={{ backgroundColor: "#faf3dd" }}>Name - {user.name}</MenuItem>
      <MenuItem sx={{ backgroundColor: "#faf3dd" }}>Email - {user.email}</MenuItem>
    </MenuList>
  </Menu>
);
