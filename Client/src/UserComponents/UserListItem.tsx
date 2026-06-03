import { Avatar, Box, Text } from "@chakra-ui/react";
import type { User } from "../types";

interface Props {
  user: User;
  handleFunction: () => void;
}

export const UserListItem = ({ user, handleFunction }: Props) => (
  <Box onClick={handleFunction} backgroundColor="#FC4445">
    <Avatar mr={2} size="sm" name={user.name} src={user.pic} />
    <Box>
      <Text>{user.name}</Text>
      <Text fontSize="xs"><b>Email : </b>{user.email}</Text>
    </Box>
  </Box>
);
