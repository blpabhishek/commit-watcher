const params = new URL(document.location).searchParams;
const columns = +params.get('columns') || 3;

const maxLines = +params.get('maxLines') || 10000;

const fromDate = params.get('fromDate') || '2019-11-22';
const toDate = params.get('toDate') || new Date();

const repoName = params.get('repoPrefix') || '';

const dateInRange = function (date, [range0,range1]) {
  return date > range0 && date < range1;
}

const mapper = function (internDetails) {
  const additionDeletions = internDetails.map(x => {
    x.deletions = x.deletions * -1;
    return x;
  });
  return additionDeletions.filter(x => {
    if (x.additions > maxLines || x.deletions < -maxLines) return false;
    const authoredDate = new Date(x.authoredDate);
    return authoredDate >= new Date(fromDate);
  });
};

const toCommitDetails = function (commitDetails) {
  return (internName) => {
    const internDetail = commitDetails[internName];
    const branch = internDetail.defaultBranchRef || {target:{history:{edges:[]}}};
    return branch.target.history.edges.map(x => {
      const commit = x.node;
      const { pushedAt, name } = internDetail;
      commit['internName'] = internName;
      commit['pushedAt'] = pushedAt;
      commit['repoName'] = name;
      return commit;
    });
  };
};

const toArray = function(commitDetails){
  const interns = Object.keys(commitDetails);
  const internsWithCommits = interns.filter(intern=>commitDetails[intern]);
  const commits = [];
  internsWithCommits.forEach((x)=>{
    commits.push(...toCommitDetails(commitDetails)(x));
  });
  return commits;
};

const generateReport = function () {
  fetch(`https://commitwatcher.herokuapp.com/${repoName}`)
    .then(res => {
      return res.json();
    })
    .then(data =>{
      console.error(data.errors);
      return toArray(data.data);
    })
    .then(internDetails => {
      const vlSpecForModification = {
        $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
        columns: columns,
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

      const div = document.createElement('div');
      div.setAttribute('id', 'modification');
      document.body.append(div);
      vegaEmbed('#modification', vlSpecForModification);
    })
    .catch(e => console.log(e));
};

window.onload = generateReport;
document.title = `${document.title} ${repoName}`;
