import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import emailjs from "@emailjs/browser";
import App from "./App";
import "./index.css";

emailjs.init("_-_L6Ge-PdjfIGdtO");
setBaseUrl("http://localhost:3000");

createRoot(document.getElementById("root")!).render(<App />);