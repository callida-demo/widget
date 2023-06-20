(function() {
	let template = document.createElement("template");
	template.innerHTML = `<style></style>`;


	customElements.define("goverp-sac-csvdownload", class CSVDownload extends HTMLElement {
		constructor() {
			super();
			this._shadowRoot = this.attachShadow({mode: "open"});
			this._shadowRoot.appendChild(template.content.cloneNode(true));
		}
		
		async runDownload(table) {
			
			var resultSet = undefined;
			var ds = table.getDataSource()
			await var selections = ds.getDataSelections({"@MeasureDimension" : "AMOUNT"})
			console.log(selections);
			
			ds.getResultSet().then(
				function(value) {
					resultSet = value;
					console.log(resultSet);
					
					//First element of the array is column headers
					let _stringArray = ["Month, Program, Account, Related Agency, Appropriation, Jurisdiction, Movement Account, Reason Code, Amount"];
					
					var i = 0;
					//Create array of parsed rows
					
					(async function loop() {
						for (const result of resultSet){
							i++;
							await ds.getResultMember("GOVERP_CBMSACCOUNT", selections[i]).then(
								function(value) {
									_stringArray.push(parseRow(result), value);
									console.log("Row " + i.toString() + " parsed.");
								}
							);
						}
						console.log(_stringArray);
					})();
					
					
					//Join into a single string1
					let csvContent = _stringArray.join("\n");

					console.log(csvContent);

					var blob = new Blob([csvContent], {type: "text/csv"});
					

					window.open(window.URL.createObjectURL(blob));
			});
		}});	
	
	
	function parseRow(row, acc_member) {

		let _amount = row["GOVERP_CBMSACCOUNT"].formattedValue.replace(',', '');
		
		let indicator = acc_member.properties["GOVERP_CBMSACCOUNT.INDICATOR"];
		let mv_indicator = row["GOVERP_MOVEMENTACCOUNT"].properties["GOVERP_MOVEMENTACCOUNT.INDICATOR"];
		
		if (mv_indicator !== "") {
			indicator = mv_indicator;
		}
		
		if (indicator === "CR") {
			_amount = -_amount;
		}
		
		
		let _month = "0";
		let _program = row["GOVERP_PROGRAM"].id;
		let _account = row["GOVERP_CBMSACCOUNT"].id.split('&')[1].replace('[', '').replace(']', '');
		let _related_agency = row["GOVERP_RELATEDAGENCY"].id;
		let _appropriation = row["GOVERP_APPROPRIATION"].id;
		let _jurisdiction = row["GOVERP_JURISDICTION"].id;
		let _movement_account = row["GOVERP_MOVEMENTACCOUNT"].id;
		let _reasonCode = "1038";


		let rowElements = [_month, _program, _account, _related_agency, _appropriation, _jurisdiction, _movement_account, _reasonCode, _amount];

		for (var i = 0; i < 9; i++) {
			if (rowElements[i] === "#") {
				rowElements[i] = "";
			}
		}
		
		let rowString = rowElements.join(",");
		
		return rowString;		
	}
	
})();