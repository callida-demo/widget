(function () {
	let template = document.createElement("template");
	template.innerHTML = `
	<style>
	</style>
	`;
	
	class CSVDownload extends HTMLElement {
		constructor() {
			super();
			let shadowRoot = this.attachShadow({mode: "open"});
			shadowRoot.appendChild(template.content.cloneNode(true));
			
			this.addEventListener("click", event => {
				var event = new Event("onClick");
				this.dispatchEvent(event);
			});
			this._props = {};
		
		onCustomWidgetBeforeUpdate(changedProperties) {
			this._props = { ...this._props, ...changedProperties };
			}
		}
		customElements.define("goverp-sac-csvdownload", CSVDownload);