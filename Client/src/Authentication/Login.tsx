import { useNavigate } from "react-router-dom"
import { Button, Input, InputRightElement, FormControl, FormLabel, InputGroup, useToast, VStack } from "@chakra-ui/react"
import axios from "axios"
import { AxiosRequestConfig } from "axios"
import { useState } from "react"
import { useContext } from "react"
import { ChatContext } from "../ChatProvider"

export const Login = () => {
    const [show,setShow]=useState(false)
    const handleClick=() => setShow(!show)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const Navigate = useNavigate()
    const { setUser } = useContext(ChatContext)
    const toast = useToast()
    const handleSubmit = async () => {
        setLoading(true)
        if (!email || !password) {
            toast({
                title: "Please fill up all the details",
                status: "warning",
                isClosable: true,
                duration: 5000,
                position: "bottom"
            })
            setLoading(false)
            return;
        }
        try {
            const config: AxiosRequestConfig = {
                headers: {
                    "Content-Type": "application/json"
                }
            }
            const { data } = await axios.post("http://localhost:5000/api/users/login", { email, password }, config)
            toast({
                title: "Registration",
                status: "success",
                isClosable: true,
                duration: 5000,
                position: "bottom"
            })
            setUser(data)
            localStorage.setItem("userInfo", JSON.stringify(data))
            setLoading(false)
            Navigate("/chats")
            window.location.reload()
        } catch (err) {
            toast({
                title: "Error occured",
                status: "error",
                isClosable: true,
                duration: 5000,
                position: "bottom"
            })
            setLoading(false)
        }
    }
    return (<VStack spacing="10px">
        <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl isRequired>
            <InputGroup>
                <FormLabel>Password</FormLabel>
                <Input type={show ? "text" : "password"} placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)} />
                <InputRightElement>
                    <Button onClick={handleClick}>{show ? "Hide" : "Show"}</Button>
                </InputRightElement>
            </InputGroup>
        </FormControl>
        <Button isLoading={loading} onClick={handleSubmit}>Login</Button>
        <Button isLoading={loading} onClick={() => {
            setEmail("guest@example.com")
            setPassword("123456789")
        }}>Use guest credentials</Button>
    </VStack>)
}