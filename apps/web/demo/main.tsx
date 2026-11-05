import { createRoot } from "react-dom/client";

// Photos are published next to the page as specimens/<key>.jpg.
(globalThis as { __SOG_PHOTO_BASE?: string }).__SOG_PHOTO_BASE = "specimens/";
// Guide images are published next to the page as guides/<key>.{jpg,png,svg}.
(globalThis as { __SOG_GUIDE_BASE?: string }).__SOG_GUIDE_BASE = "guides/";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App />);
