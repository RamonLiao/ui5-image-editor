/* global _:true */

sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "custom/FilerobotImageEditor",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/m/Image",
    "sap/ui/core/Icon",
    "custom/JSZip",
    "sap/m/MessageToast",
  ],
  (
    Controller,
    FilerobotImageEditor,
    Device,
    JSONModel,
    Image,
    Icon,
    JSZip,
    MessageToast
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
        // oProductsModel.setSizeLimit(6);
        this.getView().setModel(oSettingsModel, "settings");

        let oimgEditorsModel = new JSONModel(imgEditors);
        this.getView().setModel(oimgEditorsModel, "imgEditors");

        this._setNumberOfImagesInCarousel(1);
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
            let oLink = document.createElement("a");

            oLink.href = editedImageObject.imageBase64;
            oLink.download = editedImageObject.fullName;
            oLink.click();

            console.log("Saved", editedImageObject, designState);
          },
          onBeforeSave: function (imageFileInfo) {
            // console.log("BeforeSave", imageFileInfo);
            // let base64StringOnSave = String(
            //   editedImageObject.imageBase64
            // ).slice(21); // remove "data:image/png;base64,"
            // console.log(_getFileSizeInBase64(base64StringOnSave));
          },

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
        };

        let oControl = this.getView().byId("imgContainer");
        let oDomRef = oControl.getDomRef();
        this.getView().byId("imgContainer").destroyContent();
        // console.log("editor control", oControl);
        // console.log("editor dom ref", oDomRef);
        filerobotImageEditor = new FilerobotImageEditor(oDomRef, config);

        filerobotImageEditor.render({
          onClose: (closingReason) => {
            // console.log("Closing reason", closingReason);
            filerobotImageEditor.terminate();
          },
          onModify: function (currentImageDesignState) {
            // console.log("modifying", sImgId);
            let oImg = document.getElementById(sImgId);

            // console.log("oImg", oImg);
            // console.log("Modify", currentImageDesignState);
            // let base64String = currentImageDesignState.imgSrc.slice(21); // remove "data:image/png;base64,"
            // console.log(_getFileSizeInBase64(base64String));

            let oNewImg = filerobotImageEditor.getCurrentImgData();
            let sNewImg = oNewImg.imageData.imageBase64;
            // console.log("CurrentImgData", oNewImg);

            // console.log(
            //   "Image Modified:",
            //   !(oImg.src == sNewImg) ? true : false
            // );

            // Update modified image to image model
            imgEditors[sImgId] = sNewImg;
            this.getView().getModel("imgEditors").setData(imgEditors);
          }.bind(this),
        });

        currentImgId = sImgId;
      },

      // Initialise Carousel Container
      _setNumberOfImagesInCarousel: function (iNumberOfImages) {
        if (!iNumberOfImages || iNumberOfImages < 1 || iNumberOfImages > 9) {
          return;
        }
        let oCarousel = this.getView().byId("carouselSample");
        oCarousel.destroyPages();

        oCarousel.setShowPageIndicator(false);
      },

      // Add image to Carousel
      _addImageToCarousel: function (sBase64Image) {
        let sImgId = "img" + imgCount;

        imgEditors[sImgId] = sBase64Image;
        this.getView().getModel("imgEditors").setData(imgEditors);

        let oCarousel = this.getView().byId("carouselSample");
        let oImage = new sap.m.Image(sImgId, {
          src: `{imgEditors>/${sImgId}}`,
          height: "8rem",
        });
        oImage.attachPress(this.onEditImage.bind(this));

        oCarousel.addPage(oImage);

        imgCount++;
      },

      onEditImage(oEvent) {
        // console.log("image editing");
        let sImgId = oEvent.getParameter("id");
        // console.log("clicked", sImgId, currentImgId);
        if (currentImgId === sImgId) {
          return;
        }
        let oSource = oEvent.getSource();
        let sBase64Image = oSource.mProperties.src;
        this.onOpenImgEditor(sBase64Image, sImgId);
      },

      onSaveAll: function (oEvent) {
        // const zip = new JSZip();

        // for (const id in imgEditors) {
        //   let base64StringOnSave = String(imgEditors[id]).slice(21); // remove "data:image/png;base64,"
        //   zip.file(id + ".jpg", base64StringOnSave, {
        //     base64: true,
        //   });
        // }
        // zip.generateAsync({ type: "base64" }).then(function (base64) {
        //   console.log(base64);
        //   // Create a link and download the blob
        //   let oLink = document.createElement("a");
        //   oLink.href = URL.createObjectURL(base64);
        //   // oLink.href = base64;
        //   oLink.download = "images.zip";
        //   oLink.click();

        //   MessageToast("All Images Saved");
        // });

        MessageToast("All Images Saved");
      },
    });
  }
);
