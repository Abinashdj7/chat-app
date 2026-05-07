import { Box, FormControl, Input, Button, useToast, Textarea } from "@chakra-ui/react";
import { useState } from "react";
import { useChatContext } from "../ChatProvider";
import axios, { AxiosRequestConfig } from "axios";

export const CreatePost = () => {
  const { user, posts, setPosts } = useChatContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const postDetails = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const pics = e.target.files?.[0];
    if (!pics) {
      toast({
        title: "Please select an image",
        status: "warning",
        isClosable: true,
        duration: 5000,
        position: "bottom-left",
      });
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "Enterprise_Post_Image");
      data.append("cloud_name", "dtzsg85jd");
      fetch("https://api.cloudinary.com/v1_1/dtzsg85jd/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setImage(data.url.toString());
          setLoading(false);
        })
        .catch(() => {
          toast({
            title: "Error occurred (pic)",
            isClosable: true,
            duration: 5000,
            status: "error",
            position: "bottom",
          });
          setLoading(false);
        });
    } else {
      toast({
        title: "Please select an image",
        status: "warning",
        isClosable: true,
        duration: 5000,
        position: "bottom-right",
      });
    }
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      toast({
        title: "Post cannot be made without title or description",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
    try {
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "http://localhost:5050/api/posts",
        {
          title: title,
          description: description,
          image: image,
          username: user.name,
          userId: user._id,
        },
        config
      );
      const updatedPosts = Array.isArray(posts) ? posts : [];
      setPosts([data, ...updatedPosts]);
      window.location.reload();
    } catch (err) {
      toast({
        title: "Unable to create post",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" backgroundColor={"#8fc0a9"}>
      <FormControl mb={4}>
        <Textarea
          placeholder="Title"
          backgroundColor={"#faf3dd"}
          onChange={(e) => setTitle(e.target.value)}
        />
      </FormControl>
      <FormControl mb={4}>
        <Textarea
          placeholder="Description"
          backgroundColor={"#faf3dd"}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormControl>
      <FormControl mb={4}>
        <Input type="file" accept="image/*" backgroundColor={"#faf3dd"} onChange={(e) => postDetails(e)} />
      </FormControl>
      <Button onClick={handleSubmit} isLoading={loading} backgroundColor={"#68b0ab"}>
        Create Post
      </Button>
    </Box>
  );
};

