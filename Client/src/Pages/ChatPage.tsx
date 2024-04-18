import { useContext, useState } from "react";
import { ChatContext } from "../ChatProvider";
import { SideDrawer } from "../ChatPageComponents/SideDrawer";
import { ChatBox } from "../ChatPageComponents/ChatBox";
import { MyChats } from "../ChatPageComponents/MyChats";

export const ChatPage = () => {
  const { user } = useContext(ChatContext);
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div style={{ backgroundColor: "", minHeight: "100vh" }}>
      {user && <SideDrawer />}
      {user && <MyChats fetchAgain={fetchAgain} />}
      {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
    </div>
  );
};
