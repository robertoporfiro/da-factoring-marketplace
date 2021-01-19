export const DefaultBarGraphOptions = {
  tooltips: false,
  responsive: true,
  aspectRatio: 2,
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  layout: {
    padding: {
      // left: 10
    },
  },
  scales: {
    xAxes: [
      {
        gridLines: {
          zeroLineColor: "#fff",
          lineWidth: 0,
          zeroLineWidth: 1,
        },
      },
    ],
    yAxes: [
      {
        gridLines: {
          zeroLineColor: "#fff",
          lineWidth: 0,
          zeroLineWidth: 1,
        },
        ticks: {
          beginAtZero: true,
          mirror: false,
          suggestedMin: 0,
          callback: (value) => {
            const ranges = [
              { divider: 1e6, suffix: "M" },
              { divider: 1e3, suffix: "K" },
            ];
            const formatNumber = (n) => {
              for (let i = 0; i < ranges.length; i++) {
                if (n >= ranges[i].divider) {
                  return (n / ranges[i].divider).toString() + ranges[i].suffix;
                }
              }
              return n;
            };
            return formatNumber(value);
          },
        },
      },
    ],
  },
};

export const DefaultDonutGraphOptions = {
  tooltips: false,
  responsive: true,
  aspectRatio: 1,
  maintainAspectRatio: false,
  legend: { display: false },
};
