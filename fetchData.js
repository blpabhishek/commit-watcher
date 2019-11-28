const mapper = function(internDetails) {
  const additionDeletions = internDetails.map(x => {
    x.deletions = x.deletions * -1;
    return x;
  });
  return additionDeletions.filter(x => {
    if (x.additions > 10000 || x.deletions < -10000) return false;
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
        columns: 3,
        data: {
          values: mapper(internDetails)
        },
        facet: {
          field: 'internName',
          type: 'nominal',
          sort: { op: 'count', field: 'oid', order: 'descending' }
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
                  sort: 'descending'
                },
                y: { field: 'additions', type: 'quantitative' },
                color: { value: 'green' },
                href: { field: 'url', type: 'nominal' }
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
                  sort: 'descending'
                },
                y: { field: 'deletions', type: 'quantitative' },
                color: { value: 'red' },
                href: { field: 'url', type: 'nominal' }
              }
            }
          ]
        },
        resolve: { scale: { x: 'independent', y: 'independent' } },
        transform: [
          {
            calculate:
              "'https://github.com/step-batch-7/'+ datum.repoName +'/commit/' + datum.oid",
            as: 'url'
          }
        ]
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
