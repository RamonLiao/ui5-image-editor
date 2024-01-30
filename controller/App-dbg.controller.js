/* global _:true */

sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "custom/FilerobotImageEditor",
    "sap/m/MessageToast",
  ],
  (Controller, FilerobotImageEditor, MessageToast) => {
    "use strict";

    return Controller.extend("ui5.imgeditor.controller.App", {
      onInit() {},

      onBeforeRendering() {},

      onAfterRendering() {},

      onUpload: function (oEvent) {
        var oFileUploader = this.getView().byId("myFileUploader");
        var oFile = oFileUploader.oFileUpload.files[0];
        var oReader = new FileReader();

        oReader.onload = function (oEvent) {
          var sBase64Image = oEvent.target.result;
          var oImage = new sap.m.Image({
            src: sBase64Image,
          });
          var oPanel = this.getView().byId("myPanel");
          oPanel.addContent(oImage);

          // this.onOpenImgEditor(sBase64Image);
        }.bind(this);

        oReader.readAsDataURL(oFile);
      },

      onUploadComplete: function (oEvent) {},

      onUploadPress: function () {
        let oFileUploader = this.getView().byId("fileUploader");
        var oFile = oFileUploader.oFileUpload.files[0];
        var oReader = new FileReader();

        oReader.onload = function (oEvent) {
          let sBase64Image = oEvent.target.result;
          this.onOpenImgEditor(sBase64Image);
        }.bind(this);

        oReader.readAsDataURL(oFile);
      },

      onOpenImgEditor: function (oImg) {
        const { TABS, TOOLS } = FilerobotImageEditor;
        const config = {
          source: oImg,
          onSave: function (editedImageObject, designState) {
            var oLink = document.createElement("a");

            oLink.href = editedImageObject.imageBase64;
            oLink.download = editedImageObject.fullName;
            oLink.click();

            console.log("saved", editedImageObject, designState);
          },
          annotationsCommon: {
            fill: "#ff0000",
          },
          Text: { text: "Filerobot..." },
          Rotate: { angle: 90, componentType: "slider" },
          translations: {
            profile: "Profile",
            coverPhoto: "Cover photo",
            facebook: "Facebook",
            socialMedia: "Social Media",
            fbProfileSize: "180x180px",
            fbCoverPhotoSize: "820x312px",
          },
          Crop: {
            presetsItems: [
              {
                titleKey: "classicTv",
                descriptionKey: "4:3",
                ratio: 4 / 3,
                // icon: CropClassicTv, // optional, CropClassicTv is a React Function component. Possible (React Function component, string or HTML Element)
              },
              {
                titleKey: "cinemascope",
                descriptionKey: "21:9",
                ratio: 21 / 9,
                // icon: CropCinemaScope, // optional, CropCinemaScope is a React Function component.  Possible (React Function component, string or HTML Element)
              },
            ],
            presetsFolders: [
              {
                titleKey: "socialMedia", // will be translated into Social Media as backend contains this translation key
                // icon: Social, // optional, Social is a React Function component. Possible (React Function component, string or HTML Element)
                groups: [
                  {
                    titleKey: "facebook",
                    items: [
                      {
                        titleKey: "profile",
                        width: 180,
                        height: 180,
                        descriptionKey: "fbProfileSize",
                      },
                      {
                        titleKey: "coverPhoto",
                        width: 820,
                        height: 312,
                        descriptionKey: "fbCoverPhotoSize",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          tabsIds: [TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK], // or ['Adjust', 'Annotate', 'Watermark']
          defaultTabId: TABS.ANNOTATE, // or 'Annotate'
          defaultToolId: TOOLS.TEXT, // or 'Text'
        };

        let oControl = this.getView().byId("imgContainer");
        let oDomRef = oControl.getDomRef();
        console.log(oControl);
        console.log(oDomRef);
        const filerobotImageEditor = new FilerobotImageEditor(oDomRef, config);

        filerobotImageEditor.render({
          onClose: (closingReason) => {
            console.log("Closing reason", closingReason);
            filerobotImageEditor.terminate();
          },
        });
      },
    });
  }
);
