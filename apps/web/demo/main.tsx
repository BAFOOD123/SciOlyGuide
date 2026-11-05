import "./env"; // sets __SOG_PHOTO_BASE / __SOG_GUIDE_BASE before App's imports evaluate
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App />);
