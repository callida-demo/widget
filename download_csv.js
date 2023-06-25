(function() {
	let template = document.createElement("template");
	template.innerHTML = `<style></style>`;


	customElements.define("goverp-sac-csvdownload", class CSVDownload extends HTMLElement {
		constructor() {
			super();
			this._shadowRoot = this.attachShadow({mode: "open"});
			this._shadowRoot.appendChild(template.content.cloneNode(true));
		}
		
		async runDownload(table, description, comment, table_type) {
			
			var resultSet = undefined;
			var ds = table.getDataSource()
			var selections = await ds.getDataSelections({"@MeasureDimension" : "AMOUNT"})
			console.log(selections);
			
			ds.getResultSet().then(
				function(value) {
					resultSet = value;
					console.log(resultSet);
					
					//First element of the array is column headers

					var i = 0;
					//Create array of parsed rows
					
					(async function loop() {
						for (const result of resultSet){

							await ds.getResultMember("GOVERP_CBMSACCOUNT", selections[i]).then(
								function(value) {
									_stringArray.push(parseRow(result, value, description, comment, table_type));
									console.log("Row " + (i+1).toString() + " parsed.");
									i++;
								}
							);
						}
						console.log(_stringArray);					
						//Join into a single string1
						let csvContent = _stringArray.join("\r\n");

						console.log(csvContent);

						var blob = new Blob([csvContent], {type: "text/csv"});
						console.log("Saving...");					

						window.open(window.URL.createObjectURL(blob));
					})();
					
					


			});
		}});	
	
	
	function parseRow(row, acc_member, _description, _comment, table_type) {
		let rowString = ""
		switch (table_type) {
			case "Annual Estimates":
				rowString = parseAnnEstRow(row, acc_member, _description, _comment);
				break;
			case "Monthly Profile":
				rowString = parseMonProRow(row, acc_member, _description, _comment);
				break;
			case "Annual Actuals":
				rowString = parseAnnActRow(row, acc_member, _description, _comment);
				break;
			case "Monthly Actuals":
				rowString = parseMonActRow(row, acc_member, _description, _comment);
				break;
		return rowString;
	}
	
	function parseAnnEstRow(row, acc_member, _description, _comment) {
		let rowString = "";
		return rowString;
	}
	
	function parseMonProRow(row, acc_member, _description, _comment) {
		let rowString = "";
		
		let _program = row["GOVERP_PROGRAM"].id;
		let _account = row["GOVERP_CBMSACCOUNT"].id.split('&')[1].replace('[', '').replace(']', '');
		let _related_agency = row["GOVERP_RELATEDAGENCY"].id;
		let _spp = "X";
		let _appropriation = row["GOVERP_APPROPRIATION"].id;
		let _jurisdiction = row["GOVERP_JURISDICTION"].id;
		let _movement_account = row["GOVERP_MOVEMENTACCOUNT"].id;
		let _reasonCode = "1038";
		
		let indicator = acc_member.properties["GOVERP_CBMSACCOUNT.INDICATOR"];
		let mv_indicator = row["GOVERP_MOVEMENTACCOUNT"].properties["GOVERP_MOVEMENTACCOUNT.INDICATOR"];
		
		if (mv_indicator !== "") {
			indicator = mv_indicator;
		}
		
		let _amount = row["GOVERP_CBMSACCOUNT"].formattedValue.replace(',', '');
		if (indicator === "CR") {
			_amount = -_amount;
		}
						
		let _month = row["Date"].description;
		if (_month === '#') {
			_month = '';
		}
		_month = _month.replace('P', '0'); //e.g 'P05' becomes '005'
		
		
		// Row elements must be in same order as header string!
		let rowElements = [
		_month, 
		_program, 
		_account, 
		_related_agency, 
		_spp, 
		_appropriation, 
		_jurisdiction, 
		_movement_account,
		_description, 
		_comment, 
		_amount, 
		_reasonCode
		];
		break;		
		
		rowString = joinRowElements(rowElements);
		
		return rowString;
	}
	
	function joinRowElements(row_elements) {
		// Replace null values with blanks as per CBMS format requirements.
		for (var i = 0; i < 9; i++) {
			if (rowElements[i] === "#") {
				rowElements[i] = "";
			}
		}
		
		return rowElements.join(",");
	}

	function getTableHeaders(table_type) {
		let _stringArray = ""
		switch (table_type) {
			case "Annual Estimates": 
				_stringArray = ["Program, Reason Code, Account, Related Agency, SPP, Appropriation, Jurisdiction, Movement Account, Measure, Adjustment Description, Cmt_Justification, RB Amount, NB Amount, FE 1, FE 2, FE 3, FE 4, FE 5, FE 6, FE 7, FE 8, FE 9, FE 10, FE 11, FE 12, FE 13"];				
				break;
			case "Monthly Profile":						
				_stringArray = ["Month, Program, Account, Related Agency, SPP, Appropriation, Jurisdiction, Movement Account, Adjustment Description, Cmt_Justification, YTD Amount, Reason Code"];
				break;
			case "Annual Actuals":
				_stringArray = ["Program, Account, Journal Title, Related Agency, SPP, Appropriation, Jurisdiction, Movement Account, Cmt_Justification, Amount, Reason Code"];
				break;
			case "Monhly Actuals":
				_stringArray = ["Month, Program, Account, Related Agency, SPP , Appropriation, Jurisdiction, Movement Account, Reason Code, Journal Title, Cmt_Justification, YTD Amount"];
				break;
		}
		return _stringArray;
	}
})();