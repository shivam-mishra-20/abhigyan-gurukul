import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Helper to get device and browser info
function getDeviceAndBrowser() {
  const ua = navigator.userAgent;
  let device = "Desktop";
  if (/Mobi|Android/i.test(ua)) device = "Mobile";
  let browser = "Unknown";
  if (ua.indexOf("Chrome") > -1) browser = "Chrome";
  else if (ua.indexOf("Firefox") > -1) browser = "Firefox";
  else if (ua.indexOf("Safari") > -1) browser = "Safari";
  else if (ua.indexOf("Edge") > -1) browser = "Edge";
  else if (ua.indexOf("Opera") > -1) browser = "Opera";
  return { device, browser };
}

// Helper to get IP address (uses a public API)
async function getIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  } catch {
    return "Unknown";
  }
}

// Main log function
export async function logEvent(action) {
  const username = localStorage.getItem("studentName") || "Unknown";
  const role = localStorage.getItem("userRole") || "Unknown";
  const { device, browser } = getDeviceAndBrowser();
  const ip = await getIP();
  const date = new Date().toISOString();

  await addDoc(collection(db, "Logs"), {
    username,
    role,
    action,
    device,
    browser,
    ip,
    timestamp: serverTimestamp(),
    date,
  });
}
