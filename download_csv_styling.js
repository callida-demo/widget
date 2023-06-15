(function () {
	let template = document.createElement("template");
	template.innerHTML = `
		<style>
		fieldset {
			margin-bottom: 10px;
			border: 1px solid;
			border-radius: 3px;
		}
		table {
			width: 100%;
		}
		</style>
		`;
		
		class CSVDownloadStyling extends HTMLElement {
			constructor() {
				super();
				this._shadowRoot = this.attachShadow({mode: "open"});
				this._shadowRoot = this.appendChild(template.content.cloneNode(true));
			}
		}
	customElements.define("goverp-sac-csvdownload-styling", CSVDownloadStyling);
	})