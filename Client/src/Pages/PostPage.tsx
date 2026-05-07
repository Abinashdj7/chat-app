import { CreatePost } from "../PostPageComponents/CreatePost"
import { Posts } from "../PostPageComponents/Posts"
import { useChatContext } from "../ChatProvider"
export const PostPage = () => {
    const { user } = useChatContext()
    return (<>
        {user && <CreatePost />}
        {user && <Posts />}
    </>)
}
