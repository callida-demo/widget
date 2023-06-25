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
					var _stringArray = getTableHeaders(table_type);

					
					//Need to do a little extra work to account for multiple amount columns in annual estimates.
					var amount_array = [];
					var prev_row = undefined;			
					console.log(amount_array);
					
					var i = 0;
					//Create array of parsed rows
					(async function loop() {
						for (const result of resultSet){
							await ds.getResultMember("GOVERP_CBMSACCOUNT", selections[i]).then(
								function(value) {
									/** 
										Look, it's pretty hacky but it should work.
										The annual estimates table sends an array element for each year column with an amount in it.
										So we need to check when a new row actually starts.
										we do this by storing the previous row and checking it against the new one.
										We also need to store an array of the amounts for each year so we can add them to the one string.
									**/
									if (table_type === "Annual Estimates") {
										console.log(prev_row);
										// If this is the first row we're parsing
										if (prev_row == null){
											console.log("Parsing first row.");
											amount_array.push(result["GOVERP_CBMSACCOUNT"].formattedValue.replace(',', ''));
										}
										// If row is part of same entry
										else if (parseInt(prev_row["GOVERP_FISCALYEAR_EXT"].description) < parseInt(result["GOVERP_FISCALYEAR_EXT"].description)){
											amount_array.push(result["GOVERP_CBMSACCOUNT"].formattedValue.replace(',', ''));
										}
										// If row is the first element of a new entry
										else { 
											_stringArray.push(parseAnnEstRow(prev_row, value, amount_array));
											amount_array = [];
											console.log("Row " + (i+1).toString() + " parsed.");
											i++;
										}
										prev_row = result;
									} else {
										_stringArray.push(parseRow(result, value, description, comment, table_type));
										console.log("Row " + (i+1).toString() + " parsed.");
										i++;
									}
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
			case "Monthly":
				rowString = parseMonProRow(row, acc_member, _description, _comment);
				break;
			case "Annual Actuals":
				rowString = parseAnnActRow(row, acc_member, _description, _comment);
				break;
		}
		return rowString;
	}
	
	function parseAnnEstRow(row, acc_member, amount_array) {
		let _program = row["GOVERP_PROGRAM"].id;
		let _reasonCode = row["GOVERP_REASONCODE"].id;
		let _account = row["GOVERP_CBMSACCOUNT"].id.split('&')[1].replace('[', '').replace(']', '');
		let _related_agency = row["GOVERP_RELATEDAGENCY"].id;
		let _spp = row["GOVERP_SPP"].id;
		let _appropriation = row["GOVERP_APPROPRIATION"].id;
		let _jurisdiction = row["GOVERP_JURISDICTION"].id;
		let _movement_account = row["GOVERP_MOVEMENTACCOUNT"].id;
		let _measure = row["GOVERP_MEASURECODE"].id;
		let _description = row["GOVERP_BATCH"].description;
		let _comment = row["GOVERP_BATCH.COMMENT"].description;
		
		console.log(amount_array);
		
		// Pad the end of the amount array with blank strings
		amount_array = Object.assign(new Array(15).fill('') , amount_array)
		
		console.log(amount_array);
		
		let indicator = acc_member.properties["GOVERP_CBMSACCOUNT.INDICATOR"];
		let mv_indicator = row["GOVERP_MOVEMENTACCOUNT"].properties["GOVERP_MOVEMENTACCOUNT.INDICATOR"];
		
		if (mv_indicator !== "") {
			indicator = mv_indicator;
		}
		
		for (int j = 0; j < amount_array.length; j++) {
			if (indicator === "CR") {
				amount_array[j] = -amount_array[j];
			}
		}
		
		//Amount columns
		let _rb_amount = amount_array[0];
		let _nb_amount = amount_array[1];
		let _fe1 = amount_array[2];
		let _fe2 = amount_array[3];
		let _fe3 = amount_array[4];
		let _fe4 = amount_array[5];
		let _fe5 = amount_array[6];
		let _fe6 = amount_array[7];
		let _fe7 = amount_array[8];
		let _fe8 = amount_array[9];
		let _fe9 = amount_array[10];
		let _fe10 = amount_array[11];
		let _fe11 = amount_array[12];
		let _fe12 = amount_array[13];
		let _fe13 = amount_array[14];
		
		["Program, Reason Code, Account, Related Agency, SPP, Appropriation, Jurisdiction, Movement Account, Measure, Adjustment Description, Cmt_Justification, RB Amount, NB Amount, FE 1, FE 2, FE 3, FE 4, FE 5, FE 6, FE 7, FE 8, FE 9, FE 10, FE 11, FE 12, FE 13"];	
		// Row elements must be in same order as header string!!
		let rowElements = [
			_program,
			_reasonCode,
			_account,
			_related_agency,
			_spp,
			_appropriation,
			_jurisdiction,
			_movement_account,
			_measure,
			_description,
			_comment,
			_rb_amount,
			_nb_amount,
			_fe1,
			_fe2,
			_fe3,
			_fe4,
			_fe5,
			_fe6,
			_fe7,
			_fe8,
			_fe9,
			_fe10,
			_fe11,
			_fe12,
			_fe13
		]
		
		rowString = joinRowElements(rowElements);		
		return rowString;
	}
	
	function parseAnnActRow(row, acc_member, _description, _comment) {
		let _program = row["GOVERP_PROGRAM"].id;
		let _account = row["GOVERP_CBMSACCOUNT"].id.split('&')[1].replace('[', '').replace(']', '');
		let _journal_title = "Title";
		let _related_agency = row["GOVERP_RELATEDAGENCY"].id;
		let _spp = row["GOVERP_SPP"].id.replace('-', '');
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
		
		
		// Row elements must be in same order as header string!
		let rowElements = [
		_program, 
		_account, 
		_description,
		_related_agency, 
		_spp, 
		_appropriation, 
		_jurisdiction, 
		_movement_account,
		_description,  
		_amount, 
		_reasonCode
		];
		
		rowString = joinRowElements(rowElements);
		
		return rowString;		
		
		
	}
	
	function parseMonProRow(row, acc_member, _description, _comment) {
		let _program = row["GOVERP_PROGRAM"].id;
		let _account = row["GOVERP_CBMSACCOUNT"].id.split('&')[1].replace('[', '').replace(']', '');
		let _related_agency = row["GOVERP_RELATEDAGENCY"].id;
		let _spp = row["GOVERP_SPP"].id.replace('-', '');
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
		
		rowString = joinRowElements(rowElements);
		
		return rowString;
	}
	
	function joinRowElements(row_elements) {
		// Replace null values with blanks as per CBMS format requirements.
		for (var i = 0; i < 9; i++) {
			if (row_elements[i] === "#") {
				row_elements[i] = "";
			}
		}
		
		return row_elements.join(",");
	}

	function getTableHeaders(table_type) {
		let _stringArray = ""
		switch (table_type) {
			case "Annual Estimates": 
				_stringArray = ["Program, Reason Code, Account, Related Agency, SPP, Appropriation, Jurisdiction, Movement Account, Measure, Adjustment Description, Cmt_Justification, RB Amount, NB Amount, FE 1, FE 2, FE 3, FE 4, FE 5, FE 6, FE 7, FE 8, FE 9, FE 10, FE 11, FE 12, FE 13"];				
				break;
			case "Monthly":						
				_stringArray = ["Month, Program, Account, Related Agency, SPP, Appropriation, Jurisdiction, Movement Account, Adjustment Description, Cmt_Justification, YTD Amount, Reason Code"];
				break;
			case "Annual Actuals":
				_stringArray = ["Program, Account, Journal Title, Related Agency, SPP, Appropriation, Jurisdiction, Movement Account, Cmt_Justification, Amount, Reason Code"];
				break;
		}
		return _stringArray;
	}
})();