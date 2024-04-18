import { Badge,CloseButton } from "@chakra-ui/react";
interface Props{
    user:any;
    handleFunction:() => any;
    admin:any;
}
export const UserBadgeItem=({user,handleFunction,admin}:Props) => {
    return(
    <>
    <Badge
        px={2}
        py={1}
        borderRadius="lg"
        m={1}
        mb={2}
        variant="solid"
        fontSize={12}
        backgroundColor={"#FC4445"}
        cursor="pointer"
        onClick={handleFunction}
      >
        {user.name}
        {admin === user._id && <span> (Admin)</span>}
        <CloseButton/>
      </Badge>
      </>)
}