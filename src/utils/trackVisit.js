import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Get browser information from user agent
const getBrowserInfo = (userAgent) => {
  const browsers = [
    { name: "Chrome", regex: /Chrome\/(\d+)/ },
    { name: "Firefox", regex: /Firefox\/(\d+)/ },
    { name: "Safari", regex: /Safari\/(\d+)/ },
    { name: "Edge", regex: /Edg\/(\d+)/ },
    { name: "Opera", regex: /OPR\/(\d+)/ },
    { name: "Internet Explorer", regex: /Trident\/.*rv:(\d+)/ }
  ];
  
  for (const browser of browsers) {
    const match = userAgent.match(browser.regex);
    if (match) {
      return {
        name: browser.name,
        version: match[1]
      };
    }
  }
  
  return {
    name: "Unknown",
    version: "Unknown"
  };
};

// Extract OS information from user agent
const getOSInfo = (userAgent) => {
  const operatingSystems = [
    { name: "Windows", regex: /Windows NT (\d+\.\d+)/ },
    { name: "Mac OS", regex: /Mac OS X (\d+[._]\d+)/ },
    { name: "iOS", regex: /iPhone OS (\d+[._]\d+)/ },
    { name: "Android", regex: /Android (\d+\.\d+)/ },
    { name: "Linux", regex: /Linux/ }
  ];
  
  for (const os of operatingSystems) {
    const match = userAgent.match(os.regex);
    if (match) {
      return {
        name: os.name,
        version: match[1] ? match[1].replace("_", ".") : "Unknown"
      };
    }
  }
  
  return {
    name: "Unknown",
    version: "Unknown"
  };
};

// Generate or retrieve session ID to group visits from the same session
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("visit_session_id");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("visit_session_id", sessionId);
  }
  return sessionId;
};

const trackVisit = async () => {
  try {
    // Get visitor information
    const pathname = window.location.pathname;
    const referrer = document.referrer || "direct";
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
    const deviceType = isMobile ? "mobile" : "desktop";
    
    // Get browser information
    const browserInfo = getBrowserInfo(userAgent);
    
    // Get OS information
    const osInfo = getOSInfo(userAgent);
    
    // Create visit log data
    const visitData = {
      pathname,
      referrer,
      userAgent,
      language,
      screenSize: {
        width: screenWidth,
        height: screenHeight
      },
      deviceType,
      browser: browserInfo.name,
      browserVersion: browserInfo.version,
      os: osInfo.name,
      osVersion: osInfo.version,
      timestamp: serverTimestamp(),
      sessionId: getSessionId()
    };
    
    // Save to Firestore
    await addDoc(collection(db, "traffic_logs"), visitData);
    console.log("Visit tracked successfully");
  } catch (error) {
    console.error("Error tracking visit:", error);
  }
};

export default trackVisit;
