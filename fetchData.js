const generateReport = function(){
  fetch("https://commiters-vega.herokuapp.com/")
		.then(res => {
			return res.json();
		})
		.then(internDetails => {
			const vlSpecForFrequency = {
				$schema: "https://vega.github.io/schema/vega-lite/v4.json",
				data: {
					values: internDetails,
				},
				mark: "tick",
				encoding: {
					facet: { field: "internName", type: "ordinal", columns: 4 },
					x: { field: "authoredDate", type: "temporal" },
				},
			};

			let div = document.createElement("div");
			div.setAttribute("id", "frequency_report");
			document.body.append(div);
			vegaEmbed("#frequency_report", vlSpecForFrequency);

			const vlSpecForModification = {
				$schema: "https://vega.github.io/schema/vega-lite/v4.json",
				width: 300,
				data: {
					values: internDetails,
				},
				mark: "bar",
				encoding: {
					facet: { field: "internName", type: "ordinal", columns: 4 },
					x: {
						field: "oid",
						type: "nominal",
						band: 0.8,
						axis: null,
					},
					y: {
						aggregate: "sum",
						field: "value",
						type: "quantitative",
					},
					color: {
						field: "modification",
						type: "nominal",
					},
				},
			};

			div = document.createElement("div");
			div.setAttribute("id", "modification");
			document.body.append(div);
			vegaEmbed("#modification", vlSpecForModification);
		})
		.catch(e => console.log(e));
}

window.onload = generateReport;
setInterval(generateReport, 60000);