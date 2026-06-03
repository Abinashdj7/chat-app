import { useState } from "react";
import { FormControl, FormLabel, VStack, InputGroup, InputRightElement, Input, Button, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dtzsg85jd/image/upload";
const CLOUDINARY_PRESET = "Enterprise";

const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("cloud_name", "dtzsg85jd");
  const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
  const data = await res.json();
  return data.url as string;
};

export const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pic, setPic] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      toast({ title: "Please select a JPEG or PNG image", status: "warning", duration: 5000, isClosable: true, position: "bottom" });
      return;
    }
    try {
      setLoading(true);
      const url = await uploadImage(file);
      setPic(url);
    } catch {
      toast({ title: "Image upload failed", status: "error", duration: 5000, isClosable: true, position: "bottom" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast({ title: "Please fill in all fields", status: "warning", duration: 5000, isClosable: true, position: "bottom" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", status: "warning", duration: 5000, isClosable: true, position: "bottom" });
      return;
    }
    try {
      setLoading(true);
      const { data } = await authApi.register(name, email, password, pic);
      localStorage.setItem("userInfo", JSON.stringify(data));
      toast({ title: "Registration successful", status: "success", duration: 5000, isClosable: true, position: "bottom" });
      navigate("/chats");
    } catch {
      toast({ title: "Registration failed", status: "error", duration: 5000, isClosable: true, position: "bottom" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing="10px">
      <FormControl isRequired>
        <FormLabel>Name</FormLabel>
        <Input type="text" placeholder="Enter your name" onChange={(e) => setName(e.target.value)} />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <Input type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} />
      </FormControl>
      <FormControl isRequired>
        <InputGroup>
          <FormLabel>Password</FormLabel>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement>
            <Button onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl isRequired>
        <InputGroup>
          <FormLabel>Confirm Password</FormLabel>
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm your password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputRightElement>
            <Button onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? "Hide" : "Show"}</Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl>
        <FormLabel>Upload your profile picture</FormLabel>
        <Input type="file" accept="image/*" onChange={handleImageUpload} />
      </FormControl>
      <Button isLoading={loading} onClick={handleSubmit}>Sign Up</Button>
    </VStack>
  );
};
