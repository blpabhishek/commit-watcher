const generateReport = function(){
  fetch("https://commiters-vega.herokuapp.com/")
		.then(res => {
			return res.json();
		})
		.then(internDetails => {
			const vlSpec = {
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

			const div = document.createElement("div");
			div.setAttribute("id", "reports");
			document.body.append(div);
			vegaEmbed("#reports", vlSpec);
		})
		.catch(e => console.log(e));
}

window.onload = generateReport;
setInterval(generateReport, 60000);