import Chart, { Tooltip } from "chart.js/auto";
import { calculate_rate_yearly } from "./calcRate";

export const CHART_COLORS = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
};

export const CHART_LINE_CFG = {
  type: "line",
  options: {
    animation: true,
    responsive: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    layout: {
      padding: 32,
    },
    scales: {
      x: {
        ticks: {
          callback: function (value, index) {
            return index % 40 === 0 || index === DATA_POINTS_LEN+1
              ? (this.getLabelForValue(value) * 100).toFixed(0) + "%"
              : null;
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          callback: function (value, index, ticks) {
            return (value * 100).toFixed(2) + "%";
          },
        },
        min: 0,
        grid: {
          display: false,
        },
      },
    },
    events: ["mousemove", "mouseout", "click", "touchstart", "touchmove"],
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        position: "myCustomPositioner",
        enabled: false,
        events: ["mousemove", "mouseout", "click", "touchstart", "touchmove"],
        external: function (ctx) {},
      },
    },
  },
};
export const DATA_POINTS_LEN = 400;
export const START_PRICE = 0.985
export const END_PRICE = 1.025
export function processPriceRateData(pegKeeperDebt, totalDebt) {
  const labels = [];
  let datapoints = [];
  const step = (END_PRICE - START_PRICE) / DATA_POINTS_LEN;
  for (let i = 0; i <= DATA_POINTS_LEN; i++) {
    const _p = START_PRICE + i * step
    labels.push(_p);
    datapoints.push(
      calculate_rate_yearly(_p, pegKeeperDebt, totalDebt)
    );
  }
  const data = {
    labels: labels,
    datasets: [
      {
        label: "rate",
        data: datapoints,
        borderColor: CHART_COLORS.yellow,
        fill: false,
        pointStyle: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
        pointHoverBorderColor: CHART_COLORS.blue,
        pointHoverBackgroundColor: "#ffffff",
        animation: false,
      },
    ],
  };
  return data;
}

export function processFractionRateData(price, totalDebt) {
  const labels = [];
  let datapoints = [];
  const step = 0.5 / DATA_POINTS_LEN
  for (let i = 0; i <= DATA_POINTS_LEN; i++) {
    labels.push(i * step);
    datapoints.push(
      calculate_rate_yearly(price, (i * totalDebt / 2) / DATA_POINTS_LEN, totalDebt)
    );
  }
  const data = {
    labels: labels,
    datasets: [
      {
        label: "rate",
        data: datapoints,
        borderColor: CHART_COLORS.purple,
        fill: false,
        pointStyle: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
        pointHoverBorderColor: CHART_COLORS.blue,
        pointHoverBackgroundColor: "#ffffff",
        animation: false,
      },
    ],
  };
  return data;
}

export function searchLabelIndex(label, labels, aprox) {
  for (let i = 0; i < labels.length; i++) {
    if (Math.abs(label - labels[i]) < aprox) {
      return i;
    }
  }
  return -1;
}

Tooltip.positioners.myCustomPositioner = function (elements, eventPosition) {
  // A reference to the tooltip model
  const tooltip = this;

  /* ... */
  return {
    x: eventPosition.x,
    y: tooltip.chart.height / 2,
  };
};
