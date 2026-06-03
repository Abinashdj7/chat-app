import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  InputRightElement,
  FormControl,
  FormLabel,
  InputGroup,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useChatContext } from "../ChatProvider";
import { authApi } from "../services/api";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useChatContext();
  const toast = useToast();

  const handleSubmit = async () => {
    if (!email || !password) {
      toast({ title: "Please fill in all fields", status: "warning", duration: 5000, isClosable: true, position: "bottom" });
      return;
    }
    try {
      setLoading(true);
      const { data } = await authApi.login(email, password);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      toast({ title: "Login successful", status: "success", duration: 5000, isClosable: true, position: "bottom" });
      navigate("/chats");
    } catch {
      toast({ title: "Invalid email or password", status: "error", duration: 5000, isClosable: true, position: "bottom" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing="10px">
      <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <Input type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} />
      </FormControl>
      <FormControl isRequired>
        <InputGroup>
          <FormLabel>Password</FormLabel>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement>
            <Button onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Button isLoading={loading} onClick={handleSubmit}>Login</Button>
      <Button isLoading={loading} onClick={() => { setEmail("guest@example.com"); setPassword("123456789"); }}>
        Use guest credentials
      </Button>
    </VStack>
  );
};
