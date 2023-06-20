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
			
			var resultSet = undefined;
			
			table.getDataSource().getResultSet().then(
				function(value) {
					resultSet = value;
					console.log(resultSet);
					
					//First element of the array is column headers
					let _stringArray = ["Month, Program, Account, Related Agency, Appropriation, Jurisdiction, Movement Account, Reason Code, Amount"];
					
					var i = 0;
					//Create array of parsed rows
					for (const result of resultSet){
						i++;
						_stringArray.push(parseRow(result));
						console.log("Row " + i.toString() + " parsed.");
					}
					console.log(_stringArray);
					
					
					//Join into a single string
					let csvContent = _stringArray.join("\n");

					console.log(csvContent);

					var blob = new Blob([csvContent], {type: "text/csv"});
					

					window.open(window.URL.createObjectURL(blob));
			});
		}});	
	
	function parseRow(row) {
		let _month = "0";
		let _program = row["GOVERP_PROGRAM"].id;
		let _account = row["GOVERP_CBMSACCOUNT"].id.split('&')[1];
		let _related_agency = row["GOVERP_RELATEDAGENCY"].id;
		let _appropriation = row["GOVERP_APPROPRIATION"].id;
		let _jurisdiction = row["GOVERP_JURISDICTION"].id;
		let _movement_account = row["GOVERP_MOVEMENTACCOUNT"].id;
		let _reasonCode = "10";
		let _amount = row["GOVERP_CBMSACCOUNT"].rawValue;

		let rowElements = [_month, _program, _account, _related_agency, _appropriation, _jurisdiction, _movement_account, _reasonCode, _amount];

		for (e in rowElements) {
			if (e === "#") {
				e = ""
			}
		}
		
		let rowString = rowElements.join(",");
		
		return rowString;		
	}
	
})();