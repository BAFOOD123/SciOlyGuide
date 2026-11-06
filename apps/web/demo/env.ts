// Must be imported before any module that reads these globals at eval time
// (e.g. guides.generated bakes the guide image base into its HTML strings).
(globalThis as { __SOG_PHOTO_BASE?: string }).__SOG_PHOTO_BASE = "specimens/";
(globalThis as { __SOG_GUIDE_BASE?: string }).__SOG_GUIDE_BASE = "guides/";
(globalThis as { __SOG_ANATOMY_BASE?: string }).__SOG_ANATOMY_BASE = "anatomy/";
