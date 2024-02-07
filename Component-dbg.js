// Provides a shim for the lodash library
sap.ui.loader.config({
  paths: {
    "custom/FilerobotImageEditor":
      // "https://scaleflex.cloudimg.io/v7/plugins/filerobot-image-editor/latest/filerobot-image-editor.min",
      "./lib/filerobot-image-editor.min",
    "custom/JSZip": "./lib/jszip.min",
  },
  shim: {
    "custom/FilerobotImageEditor": {
      amd: true,
      exports: "FilerobotImageEditor",
    },
    "custom/JSZip": {
      amd: true,
      exports: "JSZip",
    },
  },
});
sap.ui.define(["sap/ui/core/UIComponent"], (UIComponent) => {
  "use strict";

  return UIComponent.extend("ui5.imgeditor.Component", {
    metadata: {
      interfaces: ["sap.ui.core.IAsyncContentCreation"],
      manifest: "json",
    },
    init() {
      // call the init function of the parent
      UIComponent.prototype.init.apply(this, arguments);
    },
  });
});
