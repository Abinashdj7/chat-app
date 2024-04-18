import { SignUp } from "../Authentication/SignUp";
import { Login } from "../Authentication/Login";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../App.css";
import { Box, Button, Center, Container } from "@chakra-ui/react";

export const AuthPage = () => {
  const navigate = useNavigate();
  const [type, setType] = useState(false);

  const triggerAuth = () => {
    setType(!type);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) {
      navigate("/chats");
    }
  }, [navigate]);

  return (
    <Center>
      <Container>
        <Box textAlign="center">
          <Button onClick={triggerAuth}>{type ? "Sign Up" : "Login"}</Button>
          {type ? <Login /> : <SignUp />}
        </Box>
      </Container>
    </Center>
  );
};
