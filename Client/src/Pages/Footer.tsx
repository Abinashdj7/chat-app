import { Box, Grid } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

export const Footer=() => {
    const navigate=useNavigate()
    const myResume=() => {
        navigate("/resume")
    }
    return(<Box display="flex" flex="col" padding={10} sx={{backgroundColor:"black"}}>
    <Grid paddingLeft={140} color={"white"} onClick={myResume}>About me</Grid>
    <Grid paddingLeft={400} color={"white"} ><a href="https://github.com/Abinashdj7">My Github</a></Grid>
    <Grid paddingLeft={400} color={"white"}><a href="https://www.linkedin.com/in/abinash-sasikumar-a484522aa/">My LinkedIn</a></Grid>
    </Box>)
}