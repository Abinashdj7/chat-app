import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import { AuthPage } from "./Pages/AuthPage"
import { HomePage } from "./Pages/HomePage"
import { ChakraProvider } from "@chakra-ui/react"
function App(){
  return(<>
  <ChakraProvider>
  <Router>
      <Routes>
        <Route path="/" element={<AuthPage/>}/>
        <Route path="/chats" element={<HomePage/>}/>
      </Routes>
    </Router>
  </ChakraProvider>
  </>)
}
export default App