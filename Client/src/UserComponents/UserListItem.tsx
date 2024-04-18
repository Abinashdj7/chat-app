import { useContext } from "react";
import { ChatContext } from "../ChatProvider";
import { Avatar, Box, Text } from "@chakra-ui/react";

interface Props{
    user:any;
    handleFunction:() => any;
}
export const UserListItem=({user,handleFunction}:Props) => {
    return(<>
    <Box onClick={handleFunction} backgroundColor={"#FC4445"}>
        <Avatar mr={2} size="sm"
        name={user.name} src={user.pic}
        />
        <Box>
            <Text>{user.name}</Text>
            <Text fontSize="xs">
                <b>Email : </b>
                {user.email}
            </Text>
        </Box>
    </Box>
    </>)
}