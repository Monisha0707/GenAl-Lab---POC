import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../style";
import HomePageLayout from "./DashbordLayout";
import Navbar from "../components/Navbar.jsx";
import ChatPromt from "../components/chatPromt.jsx";
import ChatPromtFromLocal from "../components/chatPromtFromLocal.jsx";
import DocChatPromt from "../components/DocChatPromt.jsx";
import SummarizeEmail from "../components/EmailSummarized.jsx";
import { BASE_URL } from "../Service/helper.js";
import Footer from "../components/footer.jsx"




const App = () => {
  const [message, setMessage] = useState("");
  const [activeComponent, setActiveComponent] = useState("chat"); // Default: ChatPromt

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/test`);
        setMessage(response.data.message);
      } catch (error) {
        console.error("Error occurred while fetching message: ", error);
      }
    };

    fetchData();
  }, []);

  // Component rendering based on selected nav item
  const renderComponent = () => {
    switch (activeComponent) {
      case "chat":
        return <ChatPromt />;
      case "local":
        return <ChatPromtFromLocal />;
      case "doc":
        return <DocChatPromt />;
      case "email":
        return <SummarizeEmail />;
      default:
        return <ChatPromt />;
    }
  };

  return (
    <>
    <Navbar active={activeComponent} setActive={setActiveComponent} />
    <HomePageLayout>
      

      <div className={`bg-primary ${styles.paddingX} ${styles.flexCenter} ` }>
        <div className={`${styles.boxWidth}`}>
          {renderComponent()}

          <div className="message-box mt-6 p-4 bg-white rounded shadow">
            <h3 className="font-semibold mb-2 text-black">Message from Flask Backend:</h3>
            <p className="text-gray-800">{message}</p>
          </div>
        </div>
      </div>
      <div className="  mt-20">
        <Footer/>
      </div>
      
    </HomePageLayout>
    
    </>
  );
};

export default App;
