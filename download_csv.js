(function() {
	let template = document.createElement("template");
	template.innerHTML = `<style></style>`;
	
	class CSVDownload extends HTMLElement {
		constructor() {
			super();
			let shadowRoot = this.attachShadow({mode: "open"});
			shadowRoot.appendChild(template.content.cloneNode(true));
			
			this.addEventListener("click", event => {
				console.log("Click");
			});
		}
		
		onCustomWidgetBeforeUpdate(changedProperties) {
            if ("designMode" in changedProperties) {
                this._designMode = changedProperties["designMode"];
            }
		}
	}	
	customElements.define("goverp-sac-csvdownload", CSVDownload);
})