(function() {
    let _shadowRoot;
    let _id;
    let _result ;
    let _filedata;

    let div;
    let widgetName;
    var Ar = [];
//v0.1.6

    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
      <style>
      </style>
    `;

    class Excel extends HTMLElement {

        constructor() {
            super();

            _shadowRoot = this.attachShadow({
                mode: "open"
            });
            _shadowRoot.appendChild(tmpl.content.cloneNode(true));

            _id = createGuid();

            //_shadowRoot.querySelector("#oView").id = "oView";

            this._export_settings = {};
            this._export_settings.title = "";
            this._export_settings.subtitle = "";
            this._export_settings.icon = "";
            this._export_settings.unit = "";
            this._export_settings.filedata = "";
            this._export_settings.footer = "";

            this.addEventListener("click", event => {
                console.log('click');

            });

            this._firstConnection = 0;
        }

        connectedCallback() {
            try {
                if (window.commonApp) {
                    let outlineContainer = commonApp.getShell().findElements(true, ele => ele.hasStyleClass && ele.hasStyleClass("sapAppBuildingOutline"))[0]; // sId: "__container0"

                    if (outlineContainer && outlineContainer.getReactProps) {
                        let parseReactState = state => {
                            let components = {};

                            let globalState = state.globalState;
                            let instances = globalState.instances;
                            let app = instances.app["[{\"app\":\"MAIN_APPLICATION\"}]"];
                            let names = app.names;

                            for (let key in names) {
                                let name = names[key];

                                let obj = JSON.parse(key).pop();
                                let type = Object.keys(obj)[0];
                                let id = obj[type];

                                components[id] = {
                                    type: type,
                                    name: name
                                };
                            }

                            for (let componentId in components) {
                                let component = components[componentId];
                            }

                            let metadata = JSON.stringify({
                                components: components,
                                vars: app.globalVars
                            });

                            if (metadata != this.metadata) {
                                this.metadata = metadata;

                                this.dispatchEvent(new CustomEvent("propertiesChanged", {
                                    detail: {
                                        properties: {
                                            metadata: metadata
                                        }
                                    }
                                }));
                            }
                        };

                        let subscribeReactStore = store => {
                            this._subscription = store.subscribe({
                                effect: state => {
                                    parseReactState(state);
                                    return {
                                        result: 1
                                    };
                                }
                            });
                        };

                        let props = outlineContainer.getReactProps();
                        if (props) {
                            subscribeReactStore(props.store);
                        } else {
                            let oldRenderReactComponent = outlineContainer.renderReactComponent;
                            outlineContainer.renderReactComponent = e => {
                                let props = outlineContainer.getReactProps();
                                subscribeReactStore(props.store);

                                oldRenderReactComponent.call(outlineContainer, e);
                            }
                        }
                    }
                }
            } catch (e) {}
        }

        disconnectedCallback() {
            if (this._subscription) { // react store subscription
                this._subscription();
                this._subscription = null;
            }
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            if ("designMode" in changedProperties) {
                this._designMode = changedProperties["designMode"];
            }
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            var that = this;

            // Load script for parsing the excel file
            let xlsxjs = "https://callida-demo.github.io/widget/xlsx.js";
            async function LoadLibs() {
                try {
                    await loadScript(xlsxjs, _shadowRoot);
                } catch (e) {
                    console.log(e);
                } finally {
                    loadthis(that, changedProperties);
                }
            }
            LoadLibs();
        }

        _renderExportButton() {
            let components = this.metadata ? JSON.parse(this.metadata)["components"] : {};
        }

        _firePropertiesChanged() {
            this.unit = "";
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        unit: this.unit,
                        filedata: this.filedata
                    }
                }
            }));
        }

        // SETTINGS
        get title() {
            return this._export_settings.title;
        }
        set title(value) {
            console.log("setTitle:" + value);
            this._export_settings.title = value;
        }

        get subtitle() {
            return this._export_settings.subtitle;
        }
        set subtitle(value) {
            this._export_settings.subtitle = value;
        }

        get icon() {
            return this._export_settings.icon;
        }
        set icon(value) {
            this._export_settings.icon = value;
        }

        get unit() {
            return this._export_settings.unit;
        }
        set unit(value) {
        }

        get filedata() {
            return this._export_settings.filedata;
        }
        set filedata(value) {
            value = _filedata;
//            console.log("filedata: " + value);
            this._export_settings.filedata = value;
        }

        get footer() {
            return this._export_settings.footer;
        }
        set footer(value) {
            this._export_settings.footer = value;
        }

        getNextRow() {

            // Return a row of data from the table
            // SAC script can only deal with a single dimension array, so
            // this method pops the top row and converts to an array of strings.

            if (_filedata === undefined){  // error handling - empty file or bad call
                return [];
            }
            // move the rirst row of data from the global to a local
            let topRow = _filedata.shift();
            var nextRow = [];
            if (topRow != undefined)
            {
            var cell = "dummy";
            // Convert to an array of strings
            for (var i = 0; i < topRow.length; i++) {
               if (typeof topRow[i] === "string") {
                    nextRow.push(topRow[i]);
                } else {
                    cell = String(topRow[i]);
                    nextRow.push(cell);
                }
            }
            }
            return nextRow;
        }

        static get observedAttributes() {
            return [
                "title",
                "subtitle",
                "icon",
                "unit",
                "footer",
                "link",
                "filedata"
            ];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue != newValue) {
                this[name] = newValue;
            }
        }

    }
    customElements.define("goverp-sac-excel_upload", Excel);

    // UTILS
    function loadthis(that, changedProperties) {
  var that_ = that;

  widgetName = changedProperties.widgetName;
  if (typeof widgetName === "undefined") {
    widgetName = that._export_settings.title.split("|")[0];
  }


  div = document.createElement('div');
  div.slot = "content_" + widgetName;

  if (that._firstConnection === 0) {
    let div0 = document.createElement('div');
    div0.innerHTML = '<?xml version="1.0"?><script id="oView_' + widgetName + '" name="oView_' +
    widgetName + '" type="sapui5/xmlview"><mvc:View height="100%" xmlns="sap.m" xmlns:u="sap.ui.unified" xmlns:f="sap.ui.layout.form" xmlns:core="sap.ui.core"' +
    ' xmlns:mvc="sap.ui.core.mvc" controllerName="myView.Template"><f:SimpleForm editable="true"><f:content><VBox><u:FileUploader id="idfileUploader"' +
    ' width="100%" useMultipart="false" sendXHR="true" sameFilenameAllowed="true" buttonText="" fileType="xlsx" placeholder="" style="Emphasized" change="onValidate">' +
    '</u:FileUploader></VBox></f:content></f:SimpleForm></mvc:View></script>';
    _shadowRoot.appendChild(div0);

    // let div0 = document.createElement('div');
    // div0.innerHTML = '<?xml version="1.0"?><script id="oView_' + widgetName + '" name="oView_' +
    // widgetName + '" type="sapui5/xmlview"><mvc:View height="100%" xmlns="sap.m" xmlns:u="sap.ui.unified" xmlns:f="sap.ui.layout.form" xmlns:core="sap.ui.core"' +
    // ' xmlns:mvc="sap.ui.core.mvc" controllerName="myView.Template"><f:SimpleForm editable="true"><f:content><Label text="Upload"></Label><VBox><u:FileUploader id="idfileUploader"' +
    // ' width="100%" useMultipart="false" sendXHR="true" sameFilenameAllowed="true" buttonText="" fileType="xlsx" placeholder="" style="Emphasized" change="onValidate">' +
    // '</u:FileUploader></VBox></f:content></f:SimpleForm></mvc:View></script>';
    // _shadowRoot.appendChild(div0);

    let div1 = document.createElement('div');
    div1.innerHTML = '<?xml version="1.0"?><script id="myXMLFragment_' + widgetName + '" type="sapui5/fragment"><core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><SelectDialog title="Partner Number" class="sapUiPopupWithPadding"  items="{' + widgetName + '>/}" search="_handleValueHelpSearch"  confirm="_handleValueHelpClose"  cancel="_handleValueHelpClose"  multiSelect="true" showClearButton="true" rememberSelections="true"><StandardListItem icon="{' + widgetName + '>ProductPicUrl}" iconDensityAware="false" iconInset="false" title="{' + widgetName + '>partner}" description="{' + widgetName + '>partner}" /></SelectDialog></core:FragmentDefinition></script>';
    _shadowRoot.appendChild(div1);

    let div2 = document.createElement('div');
    div2.innerHTML = '<div id="ui5_content_' + widgetName + '" name="ui5_content_' + widgetName + '"><slot name="content_' + widgetName + '"></slot></div>';
    _shadowRoot.appendChild(div2);

    // let div0 = document.createElement('div');
    // div0.innerHTML = '<?xml version="1.0"?><script id="oView_' + widgetName + '" name="oView_' +
    // widgetName + '" type="sapui5/xmlview"><mvc:View height="100%" xmlns="sap.m" xmlns:u="sap.ui.unified" xmlns:f="sap.ui.layout.form" xmlns:core="sap.ui.core"' +
    // ' xmlns:mvc="sap.ui.core.mvc" controllerName="myView.Template"><f:SimpleForm editable="true"><f:content><Label text="Upload"></Label><VBox><u:FileUploader id="idfileUploader"' +
    // ' width="100%" useMultipart="false" sendXHR="true" sameFilenameAllowed="true" buttonText="" fileType=["xlsx","xlsm]" placeholder="" style="Emphasized" change="onValidate">' +
    // '</u:FileUploader></VBox></f:content></f:SimpleForm></mvc:View></script>';
    // _shadowRoot.appendChild(div0);

    // let div1 = document.createElement('div');
    // div1.innerHTML = '<?xml version="1.0"?><script id="myXMLFragment_' + widgetName + '" type="sapui5/fragment"><core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><SelectDialog title="Partner Number" class="sapUiPopupWithPadding"  items="{' + widgetName + '>/}" search="_handleValueHelpSearch"  confirm="_handleValueHelpClose"  cancel="_handleValueHelpClose"  multiSelect="true" showClearButton="true" rememberSelections="true"><StandardListItem icon="{' + widgetName + '>ProductPicUrl}" iconDensityAware="false" iconInset="false" title="{' + widgetName + '>partner}" description="{' + widgetName + '>partner}" /></SelectDialog></core:FragmentDefinition></script>';
    // _shadowRoot.appendChild(div1);

    // let div2 = document.createElement('div');
    // div2.innerHTML = '<div id="ui5_content_' + widgetName + '" name="ui5_content_' + widgetName + '"><slot name="content_' + widgetName + '"></slot></div>';
    // _shadowRoot.appendChild(div2);

    that_.appendChild(div);

    var mapcanvas_divstr = _shadowRoot.getElementById('oView_' + widgetName);
    var mapcanvas_fragment_divstr = _shadowRoot.getElementById('myXMLFragment_' + widgetName);

    Ar.push({
      'id': widgetName,
      'div': mapcanvas_divstr,
      'divf': mapcanvas_fragment_divstr
    });
  }

  that_._renderExportButton();

  sap.ui.getCore().attachInit(function() {
    "use strict";

    //### Controller ###
    sap.ui.define([
      "jquery.sap.global",
      "sap/ui/core/mvc/Controller",
      "sap/ui/model/json/JSONModel",
      "sap/m/MessageToast",
      "sap/ui/core/library",
      "sap/ui/core/Core",
      'sap/ui/model/Filter',
      'sap/m/library',
      'sap/m/MessageBox',
      'sap/ui/unified/DateRange',
      'sap/ui/core/format/DateFormat',
      'sap/ui/model/BindingMode',
      'sap/ui/core/Fragment',
      'sap/m/Token',
      'sap/ui/model/FilterOperator',
      'sap/ui/model/odata/ODataModel',
      'sap/m/BusyDialog'
    ], function(jQuery, Controller, JSONModel, MessageToast, coreLibrary, Core, Filter, mobileLibrary, MessageBox, DateRange, DateFormat, BindingMode, Fragment, Token, FilterOperator, ODataModel, BusyDialog) {
      "use strict";

      var busyDialog = (busyDialog) ? busyDialog : new BusyDialog({});

      return Controller.extend("myView.Template", {

        onInit: function() {
        //   console.log(that._export_settings.title);
        //   console.log("widgetName:" + that.widgetName);

          if (that._firstConnection === 0) {
            that._firstConnection = 1;
          }
        },

        onValidate: function(e) {

          //var fU = this.getView().byId("idfileUploader");
          //var domRef = fU.getFocusDomRef();
          //var file = domRef.files[0];
          var files = e.getParameter("files");
          var file = files[0];
          var this_ = this;

          var oModel = new JSONModel();
          oModel.setData({
            result_final: null
          });

          var reader = new FileReader();
          reader.onload = async function(e) {
            var strCSV = e.target.result;

            var workbook = XLSX.read(strCSV, {
              type: 'binary'
            });

            var correctsheet = false;
            var usedsheetname = '';
            var topRow = [];
            var numsheets = workbook.Sheets.length;
            var sheet0 = workbook.Sheets[0];
            workbook.SheetNames.forEach(function(sheetName) {
                console.log("Checking sheet" + sheetName);
                var sheetJson = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                topRow = sheetJson[0];
                if (topRow.indexOf('Date') > 0 || topRow.indexOf('Fiscal Year') > 0) {
                    correctsheet = true;
                    usedsheetname = sheetName;
                    _filedata = sheetJson;
                } else if (correctsheet === false) {
                    // Grab the first sheet anyway
                    correctsheet = true;
                    usedsheetname = sheetName;
                    _filedata = sheetJson;
                }

            });

            if (correctsheet) {
              var lengthfield = _filedata.length;
              console.log("lengthfield: " + lengthfield);

              if (lengthfield >= 0) {

                if (lengthfield === 0) {
                  // fU.setValue("");
                  MessageToast.show("There is no record to be uploaded");
                } else if (lengthfield >= 2001) {
                  // fU.setValue("");
                  MessageToast.show("Maximum records are 2000.");
                } else {
                  // _filedata = result_final.shift();
                  // _result = JSON.stringify(_filedata);
                  // // Bind the data to the Table
                  // oModel = new JSONModel();
                  // oModel.setSizeLimit("5000");
                  // oModel.setData({
                  //   result_final: result_final
                  // });
                  //
                  // var oModel1 = new sap.ui.model.json.JSONModel();
                  // oModel1.setData({
                  //   fname: file.name,
                  // });
                  // console.log(oModel);

//                  _result = JSON.stringify(result_final);

                  that._firePropertiesChanged();
                  this.settings = {};
                  this.settings.result = "";

                  that.dispatchEvent(new CustomEvent("onStart", {
                    detail: {
                      settings: this.settings
                    }
                  }));

                  this_.runNext();
                  // fU.setValue("");
                }
              } else {
                // fU.setValue("");
                MessageToast.show("Worksheet " + usedsheetname + " is empty");
              }
            } else {
              // console.log("Error: wrong xlsx template");
              MessageToast.show("Wrong xlsx template - Please upload the correct file");
            }
          };

          if (typeof file !== 'undefined') {
            reader.readAsBinaryString(file);
          }
        },
    
        wasteTime: function() {
          busyDialog.open();
        },

        runNext: function() {
          busyDialog.close();
        },

      });
    });

    console.log("widgetName Final:" + widgetName);
    var foundIndex = Ar.findIndex(x => x.id == widgetName);
    var divfinal = Ar[foundIndex].div;
 //   console.log(divfinal);

//    var mike = jQuery(divfinal).html();
//    console.log(mike);
    //### THE APP: place the XMLView somewhere into DOM ###
    var oView = sap.ui.xmlview({
      viewContent: jQuery(divfinal).html(),
    });

    oView.placeAt(div);
    if (that_._designMode) {
      oView.byId("idfileUploader").setEnabled(false);
    }
  });
}

    function createGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function loadScript(src, shadowRoot) {
        return new Promise(function(resolve, reject) {
            let script = document.createElement('script');
            script.src = src;

            script.onload = () => {
               // console.log("Load: " + src);
                resolve(script);
            }
            script.onerror = () => reject(new Error(`Script load error for ${src}`));

            shadowRoot.appendChild(script)
        });
    }
})();
