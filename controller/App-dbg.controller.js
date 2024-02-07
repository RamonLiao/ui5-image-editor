/* global _:true */

sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "custom/FilerobotImageEditor",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Image",
    "sap/ui/core/Icon",
    "custom/JSZip",
  ],
  (
    Controller,
    FilerobotImageEditor,
    Device,
    JSONModel,
    MessageToast,
    Image,
    JSZip
  ) => {
    "use strict";

    let imgCount = 0;
    let imgEditors = {};
    let filerobotImageEditor;
    let currentImgId;

    return Controller.extend("ui5.imgeditor.controller.App", {
      onInit() {
        let iPagesCount = 1;

        if (Device.system.desktop) {
          iPagesCount = 4;
        } else if (Device.system.tablet) {
          iPagesCount = 2;
        }

        let oSettingsModel = new JSONModel({ pagesCount: iPagesCount });
        this.getView().setModel(oSettingsModel, "settings");

        let oimgEditorsModel = new JSONModel(imgEditors);
        this.getView().setModel(oimgEditorsModel, "imgEditors");

        this._initialiseCarousel();
      },

      onBeforeRendering() {},

      onAfterRendering() {},

      // Convert Base64 String to File Size
      _getFileSizeInBase64: function (sBase64String) {
        const padding = sBase64String.endsWith("==")
          ? 2
          : sBase64String.endsWith("=")
          ? 1
          : 0;
        const sizeInBytes = (sBase64String.length / 4) * 3 - padding;
        const sizeInKB = sizeInBytes / 1024;
        const sizeInMB = sizeInKB / 1000;
        return { sizeInBytes, sizeInKB, sizeInMB };
      },

      // Second Icon Tab : Upload and Show Image
      onUploadnShow: function (oEvent) {
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
        }.bind(this);

        oReader.readAsDataURL(oFile);
      },

      // First Icon Tab: Upload Image to Carousel
      onUploadAddImage: function () {
        let oFileUploader = this.getView().byId("fileUploaderCarousel");
        let oFile = oFileUploader.oFileUpload.files[0];

        if (oFile) {
          let oReader = new FileReader();

          oReader.onload = function (oEvent) {
            let sBase64Image = oEvent.target.result;
            this._addImageToCarousel(sBase64Image);
          }.bind(this);

          oReader.readAsDataURL(oFile);
        }
      },

      // Open Image Editor
      onOpenImgEditor: function (sImg, sImgId) {
        if (filerobotImageEditor && currentImgId !== sImgId) {
          filerobotImageEditor.terminate();
        }

        // const _getFileSizeInBase64 = this._getFileSizeInBase64;
        const { TABS, TOOLS } = FilerobotImageEditor;
        const config = {
          source: sImg,
          onSave: function (editedImageObject, designState) {
            this._saveAll(imgEditors);
          }.bind(this),

          onBeforeSave: function (imageFileInfo) {},

          annotationsCommon: {
            fill: "#00000000",
            stroke: "#ff0000",
            strokeWidth: 2,
          },
          Text: { text: "Text..." },
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
          tabsIds: [TABS.ADJUST, TABS.ANNOTATE], // or ['Adjust', 'Annotate', 'Watermark']
          defaultTabId: TABS.ANNOTATE, // or 'Annotate'
          defaultToolId: TOOLS.ELLIPSE, // or 'Text'
          defaultSavedImageName: "image",
          defaultSavedImageType: "jpg",
          // defaultSavedImageQuality: 0.5, // possible values: [0.1 - 1.0]
        };

        let oControl = this.getView().byId("imgContainer");
        let oDomRef = oControl.getDomRef();
        this.getView().byId("imgContainer").destroyContent();
        filerobotImageEditor = new FilerobotImageEditor(oDomRef, config);

        filerobotImageEditor.render({
          onClose: (closingReason) => {
            filerobotImageEditor.terminate();
          },

          // Get modified info during editing
          onModify: function (currentImageDesignState) {
            // Get modified image base64
            let oNewImg = filerobotImageEditor.getCurrentImgData();
            let sNewImg = oNewImg.imageData.imageBase64;

            // Update modified image to image model
            imgEditors[sImgId] = sNewImg;
            this.getView().getModel("imgEditors").setData(imgEditors);
          }.bind(this),
        });

        currentImgId = sImgId;
      },

      // Initialise Carousel Container
      _initialiseCarousel: function () {
        let oCarousel = this.getView().byId("carouselSample");
        oCarousel.destroyPages();

        if (Device.system.desktop) {
          oCarousel.setShowPageIndicator(false);
        } else if (Device.system.tablet || Device.system.phone) {
          oCarousel.setShowPageIndicator(true);
          oCarousel.setPageIndicatorBackgroundDesign("Translucent"); // [Solid, Translucent, Transparent]
          oCarousel.setPageIndicatorBorderDesign("None"); // [None, Solid]
        }
      },

      // Add image to Carousel
      _addImageToCarousel: function (sBase64Image) {
        let sImgId = "img" + imgCount;

        imgEditors[sImgId] = sBase64Image;
        this.getView().getModel("imgEditors").setData(imgEditors);

        let oCarousel = this.getView().byId("carouselSample");
        let oImage = new Image(sImgId, {
          src: `{imgEditors>/${sImgId}}`,
          height: "8rem",
        });
        oImage.attachPress(this.onEditImage.bind(this));

        oCarousel.addPage(oImage); // Add image to carousel
        this.onOpenImgEditor(sBase64Image, sImgId); // Open image editor

        imgCount++;
      },

      // Click an image to open image editor
      onEditImage(oEvent) {
        let sImgId = oEvent.getParameter("id");
        if (currentImgId === sImgId) {
          return;
        }
        let oSource = oEvent.getSource();
        let sBase64Image = oSource.mProperties.src;
        this.onOpenImgEditor(sBase64Image, sImgId);
      },

      _saveAll: function (oEditors) {
        if (Object.keys(oEditors).length > 0) {
          // ----- Download All Images Individually-----
          for (const id in oEditors) {
            let oLink = document.createElement("a");

            oLink.href = oEditors[id];
            oLink.download = id;
            oLink.click();

            console.log("Saved", id);
          }

          MessageToast.show("All Images Saved");

          // ----- Zip File and Download -----
          // const zip = new JSZip();

          // for (const id in oEditors) {
          //   const base64StringArr = String(oEditors[id]).split(",");

          //   // let base64StringOnSave = String(oEditors[id]).slice(21); // remove "data:image/png;base64,"
          //   let base64StringOnSave = base64StringArr[1];
          //   zip.file(id + ".jpg", base64StringOnSave, {
          //     base64: true,
          //   });
          // }

          // zip.generateAsync({ type: "blob" }).then(function (blob) {
          //   // Create a link and download the blob
          //   const sUrl = URL.createObjectURL(blob);
          //   const oLink = document.createElement("a");
          //   oLink.href = sUrl;
          //   oLink.download = "images.zip";
          //   oLink.click();

          //   URL.revokeObjectURL(sUrl);
          // });
        } else {
          MessageToast.show("No Images to be saved");
        }
      },

      onSaveAll: function (oEvent) {
        this._saveAll(imgEditors);
      },
    });
  }
);
