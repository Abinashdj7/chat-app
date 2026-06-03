import { Badge, CloseButton } from "@chakra-ui/react";
import type { User } from "../types";

interface Props {
  user: User;
  handleFunction: () => void;
  admin: string | undefined;
}

export const UserBadgeItem = ({ user, handleFunction, admin }: Props) => (
  <Badge
    px={2} py={1} borderRadius="lg" m={1} mb={2}
    variant="solid" fontSize={12} backgroundColor="#FC4445"
    cursor="pointer" onClick={handleFunction}
  >
    {user.name}
    {admin === user._id && <span> (Admin)</span>}
    <CloseButton />
  </Badge>
);
