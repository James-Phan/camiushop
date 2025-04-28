import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add fonts
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';

// Import Remix icon
import 'remixicon/fonts/remixicon.css';

createRoot(document.getElementById("root")!).render(<App />);
