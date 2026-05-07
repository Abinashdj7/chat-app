import { useContext, useEffect, useState } from "react"
import { ChatContext } from "../ChatProvider"
import { Box } from "@chakra-ui/react"
import axios, { AxiosRequestConfig } from "axios"
import { PostInterface } from "./PostInterface"
export interface Post {
    _id: string;
    userId: string;
    title: string;
    description: string;
    username: string;
    image: string;
}
export const Posts = () => {
    const ctx = useContext(ChatContext)
    const user = ctx?.user
    const [posts, setPosts] = useState([])
    const getPost = async () => {
        try {
            const config: AxiosRequestConfig = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            }
            const { data } = await axios.get("http://localhost:5050/api/posts", config)
            setPosts(data)
        } catch (_err) {
        }
    }
    useEffect(() => {
        getPost()
    }, [])
    return (<Box p={4} >
        {Array.isArray(posts) && posts.map((post) => {
            return (<PostInterface post={post} />)
        })}
    </Box>)
}
