import { SingleChat } from "../Messaging/SingleChat"
interface Props {
    fetchAgain: boolean;
    setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
}
export const ChatBox = ({ fetchAgain, setFetchAgain }: Props) => {
    return (<>
        <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}></SingleChat>
    </>)
}
