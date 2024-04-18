import { useContext, useState } from "react"
import { CreatePost } from "../PostPageComponents/CreatePost"
import { Posts } from "../PostPageComponents/Posts"
import { ChatContext } from "../ChatProvider"
export const PostPage=() => {
    const[fetchAgain,setFetchAgain]=useState(false)
    const {user} =useContext(ChatContext)
    return(<>
    {user && <CreatePost/>}
    {user && <Posts />}
    </>)
}