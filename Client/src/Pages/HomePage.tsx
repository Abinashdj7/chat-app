import { useContext, useState } from "react";
import { ChatPage } from "./ChatPage";
import { PostPage } from "./PostPage";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { ChatContext } from "../ChatProvider";

export const HomePage = () => {
  const [mode, setMode] = useState(false);

  const changeMode = () => {
    setMode(!mode);
  };
  return (
    <div>
      
      <NavBar mode={mode} changeMode={changeMode}/>
      <div style={{ minHeight: "100vh" }}>
        {mode ? <PostPage /> : <ChatPage />}
      </div>
      <Footer/>
    </div>
  );
};
