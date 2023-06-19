(function() {
	let template = document.createElement("template");
	template.innerHTML = `<style></style>`;


	customElements.define("goverp-sac-csvdownload", class CSVDownload extends HTMLElement {
		constructor() {
			super();
			this._shadowRoot = this.attachShadow({mode: "open"});
			this._shadowRoot.appendChild(template.content.cloneNode(true));
		}
		
		runDownload(table) {
			console.log(table.getDataSource.getResultSet())
			
			//First element of the array is column headers
			let _stringArray = ["Month, Program, Account, Related Agency, Appropriation, Jurisdiction, Movement Account, Reason Code, Amount"];
			
			//Create array of parsed rows
			for (var i = 0; i < 100; i++){
				_stringArray.push(parseRow("1"));
			}
			
			
			//Join into a single string
			let csvContent = "data:text/csv;charset=utf-8," + _stringArray.map(e => e.join("\n");

			var encodedUri = encodeUri(csvContent);
			window.open(encodedUri);
		}
		});	
	
	function parseRow(row) {
		let _month = "0";
		let _program = "1000";
		let _account = "1111111";
		let _related_agency = "#";
		let _appropriation = "#";
		let _jurisdiction = "#";
		let _movement_account = "#";
		let _reasonCode = "#";
		let _amount = "100";
		
		let rowElements = [_month, _program, _account, _related_agency, _appropriation, _jurisdiction, _movement_account, _reasonCode, _amount];
		let rowString = rowElements.join(",");
		
		
	}
	
})();