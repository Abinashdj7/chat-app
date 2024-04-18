import { SingleChat } from "../Messaging/SingleChat"
interface Props{
    fetchAgain:Boolean;
    setFetchAgain:() => Boolean;
}
export const ChatBox=({fetchAgain,setFetchAgain}:Props) => {
    return(<>
    <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}></SingleChat>
    </>)
}