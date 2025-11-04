import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../style";
import HomePageLayout from "./DashbordLayout";
import Navbar from "../components/Navbar.jsx";
import ChatPromt from "../components/chatPromt.jsx";
// is
import DocChatPromt from "../components/DocChatPromt.jsx";
import SummarizeEmail from "../components/EmailSummarized.jsx";
import AddExpanse from "../components/AddExpanse.jsx";
import { BASE_URL } from "../Service/helper.js";
import Footer from "../components/footer.jsx"
import EmbeddingManager from "../components/EmbeddingManager.jsx";
import KBManager from "../components/KBManager.jsx";
import OraChat from "../components/oraChat.jsx";
import AskKB from "../components/AskKB.jsx";
import RagChat from "../components/ragChat.jsx";



const App = () => {
  const [message, setMessage] = useState("");
  const [activeComponent, setActiveComponent] = useState("local"); // Default: ChatPromt

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get(`${BASE_URL}/message`);
  //       setMessage(response.data.message);
  //     } catch (error) {
  //       console.error("Error occurred while fetching message: ", error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // Component rendering based on selected nav item
  const renderComponent = () => {
    switch (activeComponent) {
    
      case "local":
        return <OraChat />;
      case "embedding":
        return <EmbeddingManager />;
      case "kb":
        return <KBManager />;
      case "askkb":
        return <AskKB />;
      case "ragChat":
        return <RagChat />;
      case "doc":
        return <DocChatPromt />;
      case "email":
        return <SummarizeEmail />;
      case "expense":
        return <AddExpanse />;
      default:
        return <ChatPromt />;
    }
  };

  return (
    <>
  {/* 🧭 Fixed Navbar */}
  <div className="fixed top-0 left-0 w-full z-50">
    <Navbar active={activeComponent} setActive={setActiveComponent} />
  </div>

  {/* 🌈 Fixed Fullscreen Container */}
  <div className="h-screen w-full bg-gray-700 bg-gradient-to-br from-violet-100 via-blue-100 to-teal-100 flex flex-col pt-[54px] pb-[10px] overflow-hidden">
    {/* The Chat area stays visible, no scrolling */}
    <div className="flex-1 flex items-center justify-center px-6">
      {/* <ChatPromtFromLocal /> */}
      {renderComponent()}
    </div>
  {/* 
  <div className="mt-[0px] mb-[10px]">
     
    <HomePageLayout>
      <div className="w-full max-w-6xl mx-0 p-10">
        {renderComponent()}
        <div className="message-box mt-6 p-4 bg-white rounded shadow text-center">
          <h3 className="font-semibold mb-2 text-black">
            Message from Flask Backend: {message}
          </h3>
        </div>
      </div>
    </HomePageLayout>
  </div>
*/}
  {/* <div className="mt-20">
    <Footer />
  </div> */}
</div>

    
    </>
  );
};

export default App;
