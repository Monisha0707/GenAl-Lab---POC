import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../style";
import HomePageLayout from "./DashbordLayout";
import Navbar from "../components/Navbar.jsx";
import ChatPromt from "../components/chatPromt.jsx";
import ChatPromtFromLocal from "../components/chatFromLocalLlama.jsx";
import DocChatPromt from "../components/DocChatPromt.jsx";
import SummarizeEmail from "../components/EmailSummarized.jsx";
import AddExpanse from "../components/AddExpanse.jsx";
import { BASE_URL } from "../Service/helper.js";
import Footer from "../components/footer.jsx"




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
        return <ChatPromtFromLocal />;
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
    <div className="fixed  mt-0px w-full z-50">
  <Navbar active={activeComponent} setActive={setActiveComponent} />
</div>
<div className="min-h-screen bg-gradient-to-br from-violet-100 via-blue-100 to-teal-100 p-6 animate-fade-in">
  <Navbar active={activeComponent} setActive={setActiveComponent} />

  <div className="mt-[90px] mb-[10px]">
    
    <HomePageLayout>
      <div className="w-full max-w-6xl mx-auto">
        {/* <ChatPromtFromLocal /> */}
        {renderComponent()}

        <div className="message-box mt-6 p-4 bg-white rounded shadow text-center">
          <h3 className="font-semibold mb-2 text-black">
            Message from Flask Backend: {message}
          </h3>
        </div>
      </div>
    </HomePageLayout>
  </div>

  <div className="mt-20">
    <Footer />
  </div>
</div>

    
    </>
  );
};

export default App;
