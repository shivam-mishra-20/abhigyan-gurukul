import { useState } from "react";

import "./App.css";
// import { Example } from "./components/NavigationBar";
import { NavigationBar } from "./components/NavigationBar";
import { NewNavbar } from "./components/NavigationBar-Shiv";
import Navbar from "./components/Navbar";
import { Introduction } from "./components/Introduction";

function App() {
  const [count, setCount] = useState(0);

  const text1 = (
    <p class="text-gray-600 text-3xl flex-wrap">
      At <span class="font-bold text-green-600">Abhigyan Gurukul</span>, we
      blend the wisdom of ancient traditions with
      <span class="font-bold text-green-600">modern education</span> to nurture
      young minds in a way that fosters
      <span class="font-bold text-green-600"> intellectual</span>,
      <span class="font-bold text-green-600"> emotional</span>, and
      <span class="font-bold text-green-600"> spiritual growth</span>.
    </p>
  );

  const IntroBanner = "./src/assets/Banner-Photo.jpg";

  return (
    <>
      <Navbar></Navbar>
      <Introduction Text={text1} img_url={IntroBanner}></Introduction>
      <Introduction></Introduction>
    </>
  );
}

export default App;
