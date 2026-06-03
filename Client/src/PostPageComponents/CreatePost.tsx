import { Box, FormControl, Input, Button, useToast, Textarea } from "@chakra-ui/react";
import { useState } from "react";
import { useChatContext } from "../ChatProvider";
import { postApi } from "../services/api";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dtzsg85jd/image/upload";
const CLOUDINARY_PRESET = "Enterprise_Post_Image";

const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("cloud_name", "dtzsg85jd");
  const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
  const data = await res.json();
  return data.url as string;
};

export const CreatePost = () => {
  const { user, posts, setPosts } = useChatContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
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
      setImage(url);
    } catch {
      toast({ title: "Image upload failed", status: "error", duration: 5000, isClosable: true, position: "bottom" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!title || !description) {
      toast({ title: "Title and description are required", status: "warning", duration: 5000, isClosable: true, position: "bottom" });
      return;
    }
    try {
      setLoading(true);
      const { data } = await postApi.createPost({
        title,
        description,
        image,
        username: user.name,
        userId: user._id,
      });
      setPosts([data, ...(Array.isArray(posts) ? posts : [])]);
      toast({ title: "Post created", status: "success", duration: 5000, isClosable: true, position: "bottom" });
    } catch {
      toast({ title: "Unable to create post", status: "error", duration: 5000, isClosable: true, position: "bottom" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" backgroundColor="#8fc0a9">
      <FormControl mb={4}>
        <Textarea placeholder="Title" backgroundColor="#faf3dd" onChange={(e) => setTitle(e.target.value)} />
      </FormControl>
      <FormControl mb={4}>
        <Textarea placeholder="Description" backgroundColor="#faf3dd" onChange={(e) => setDescription(e.target.value)} />
      </FormControl>
      <FormControl mb={4}>
        <Input type="file" accept="image/*" backgroundColor="#faf3dd" onChange={handleImageUpload} />
      </FormControl>
      <Button onClick={handleSubmit} isLoading={loading} backgroundColor="#68b0ab">
        Create Post
      </Button>
    </Box>
  );
};
