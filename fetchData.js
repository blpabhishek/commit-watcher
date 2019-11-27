const mapper = function(internDetails) {
  const additionDeltions = internDetails.map(x => {
    x['del'] = x.modification == 'deletions' ? x.value * -1 : 0;
    x['add'] = x.modification == 'additions' ? x.value : 0;
    return x;
  });

  return additionDeltions.filter(x => {
    if (x.add > 10000 || x.del < -10000) return false;
    const authoredDate = new Date(x.authoredDate);
    return authoredDate >= new Date('2019-11-22T12:50:28.267Z');
  });
};

const generateReport = function() {
  fetch('https://commiters-vega.herokuapp.com/')
    .then(res => {
      return res.json();
    })
    .then(internDetails => {
      const vlSpecForModification = {
        $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
        columns: 4,
        data: {
          values: mapper(internDetails)
        },
        facet: {
          field: 'internName',
          type: 'nominal'
        },
        spec: {
          layer: [
            {
              mark: 'bar',
              encoding: {
                x: {
                  field: 'authoredDate',
                  timeUnit: 'monthsdatehoursminutes',
                  type: 'ordinal',
                  title: 'date',
                  sort: 'null'
                },
                y: { field: 'add', type: 'quantitative' },
                color: { value: 'green' }
              }
            },
            {
              mark: 'bar',
              encoding: {
                x: {
                  field: 'authoredDate',
                  timeUnit: 'monthsdatehoursminutes',
                  type: 'ordinal',
                  title: 'date',
                  sort: ['authoredDate']
                },
                y: { field: 'del', type: 'quantitative' },
                color: { value: 'red' }
              }
            }
          ]
        },
        resolve: { scale: { x: 'independent', y: 'independent' } }
      };

      div = document.createElement('div');
      div.setAttribute('id', 'modification');
      document.body.append(div);
      vegaEmbed('#modification', vlSpecForModification);
    })
    .catch(e => console.log(e));
};

window.onload = generateReport;
setInterval(generateReport, 60000);
