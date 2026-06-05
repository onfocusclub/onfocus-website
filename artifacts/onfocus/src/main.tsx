import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import emailjs from "@emailjs/browser";
import App from "./App";
import "./index.css";

emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
setBaseUrl(import.meta.env.VITE_API_URL ?? "http://localhost:3000");

createRoot(document.getElementById("root")!).render(<App />);