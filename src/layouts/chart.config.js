const { __ } = require('../constants');

module.exports = function config(axesLabels) {
  return {
    type: "line",
    data: {
      datasets: [
        {
          data: [],
          borderColor: "#1aa2dd",
          backgroundColor: "transparent",
          label: __('first'),
        },
        {
          data: [],
          borderColor: "#f07e0f",
          backgroundColor: "transparent",
          label: __('second'),
        },
        {
          data: [],
          borderColor: "rgba(55,171,184,.5)",
          borderWidth: 5,
          label: __('first + second'),
          backgroundColor: "transparent"
        },
      ]
    },
    options: {
      elements: {
        point: {
          radius: 1
        },
        line: {
          tension: 0 // disables bezier curves
        }
      },
      scales: {
        xAxes: [
          {
            display: true,
            type: "linear",
            scaleLabel: {
              display: true,
              labelString: axesLabels.x
            },
            ticks: {
              maxTickLimit: 8
            }
          }
        ],
        yAxes: [
          {
            display: true,
            type: "linear",
            scaleLabel: {
              display: true,
              labelString: axesLabels.y
            },
            ticks: {
              maxTickLimit: 8
            }
          }
        ]
      },
      animation: {
        duration: 0 // general animation time
      },
      hover: {
        animationDuration: 0 // duration of animations when hovering an item
      },
      responsiveAnimationDuration: 0, // animation duration after a resize
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: "x"
          },
          zoom: {
            enabled: true,
            mode: "x"
          }
        }
      }
    }
  }
}