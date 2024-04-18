import {useState} from "react"
import { FormControl,FormLabel,VStack,InputGroup,InputRightElement,Input,Button,useToast } from "@chakra-ui/react"
import axios from "axios"
import { AxiosRequestConfig } from "axios"
import { useNavigate } from "react-router-dom"
export const SignUp=() => {
    const[show,setShow]=useState(false)
    const[show2,setShow2]=useState(false)
    const handleClick=() => setShow(!show)
    const handleClick2=() => setShow2(!show2)
    const [name,setName]=useState<string>("")
    const [email,setEmail]=useState<string>("")
    const [password,setPassword]=useState<string>("")
    const [confirmPassword,setConfirmPassword]=useState<string>("")
    const[pic,setPic]=useState<string | null>(null)
    const[loading,setLoading]=useState<boolean>(false)
    const Navigate=useNavigate()
    const toast=useToast()
    const handleSubmit=async() => {
        setLoading(true)
        if(!name || !email || !password || !confirmPassword){
            toast({
                title:"Please fill up all fields",
                status:"warning",
                isClosable:true,
                duration:5000,
                position:"bottom"
            })
            setLoading(false)
            return;
        }
        if(password!=confirmPassword){
            toast({
                title:"Passwords don't match",
                status:"warning",
                isClosable:true,
                duration:5000,
                position:"bottom"
            })
            return;
        }
        try{
            const config:AxiosRequestConfig={
                headers:{
                    "Content-type":"application/json"
                }
            }
            const {data}=await axios.post("http://localhost:5000/api/users",{name,email,password,pic},config)
            toast({
                title:"Registration successful",
                status:"success",
                isClosable:true,
                duration:5000,
                position:"bottom"
            })
            localStorage.setItem("userInfo",JSON.stringify(data))
            setLoading(false)
            Navigate("/chats")
            window.location.reload()
        }catch(err){
            toast({
                title:"Error occurred",
                status:"error",
                duration:5000,
                isClosable:true,
                position:"bottom"
            })
            setLoading(false)
        }
    }
    const postDetails=(e:React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true)
        const pics=e.target.files[0]
        if(!pics){
            toast({
                title:"Please select an image",
                status:"warning",
                isClosable:true,
                duration:5000,
                position:"bottom-left"
            })
            return;
        }
        if(pics.type==="image/jpeg" || pics.type==="image/png"){
            const data=new FormData()
            data.append("file",pics)
            data.append("upload_preset","Enterprise")
            data.append("cloud_name","dtzsg85jd")
            fetch("https://api.cloudinary.com/v1_1/dtzsg85jd/image/upload",{
                method:"post",
                body:data
            })
            .then((res) => res.json())
            .then((data) => {
                setPic(data.url.toString())
                console.log(data.url.toString())
                setLoading(false)
            })
            .catch((err) => {
                toast({
                    title:"Error occured(pic)",
                    isClosable:true,
                    duration:5000,
                    status:"error",
                    position:"bottom"
                })
                setLoading(false)
            })
        }else{
            toast({
                title:"Please select an image",
                status:"warning",
                isClosable:true,
                duration:5000,
                position:'bottom-right'
            })
        }
    }
    return(<>
    <VStack spacing="10px">
        <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input type="text" placeholder="Enter your name" onChange={(e) => setName(e.target.value)}/>
        </FormControl>
        <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)}/>
        </FormControl>
        <FormControl isRequired>
            <InputGroup>
            <FormLabel>Password</FormLabel>
            <Input type={show?"text":"password"} placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)}/>
            <InputRightElement>
            <Button onClick={handleClick}>{show?"Hide":"Show"}</Button>
            </InputRightElement>
            </InputGroup>
        </FormControl>
        <FormControl isRequired>
            <InputGroup>
            <FormLabel>Confirm Password</FormLabel>
            <Input type={show2?"text":"password"} placeholder="Enter your password" onChange={(e) => setConfirmPassword(e.target.value)}/>
            <InputRightElement>
            <Button onClick={handleClick2}>{show2?"Hide":"Show"}</Button>
            </InputRightElement>
            </InputGroup>
        </FormControl>
        <FormControl>
            <FormLabel>Upload your profile picture</FormLabel>
            <Input type="file" accept="image/*" onChange={(e) => postDetails(e)}/>
        </FormControl>
        <Button isLoading={loading} onClick={handleSubmit}>Sign Up</Button>
    </VStack>
    </>)
}