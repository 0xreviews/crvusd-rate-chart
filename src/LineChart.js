import { useEffect, useRef, useState } from "react";
import { Chart, Tooltip } from "chart.js";
import { calculate_rate_yearly } from "./calcRate";
import { CHART_LINE_CFG, DATA_POINTS_LEN } from "./chartConfig";
import { externalTooltipHandler } from "./tooltip";

export default function LineChart({
  type,
  defaultTooltipIndex,
  renderTimeoutId,
  data,
  tooltipHead2,
  tooltipHanlder,
  onMoveOut,
}) {
  const chartRef = useRef(null);

  // render fraction-rate line
  useEffect(() => {
    if (!data || defaultTooltipIndex < 0) return;
    let chart = Chart.getChart(`${type}ChartId`);
    if (!chart) {
      chart = new Chart(chartRef.current, {
        type: "line",
        data: data,
        options: {
          ...CHART_LINE_CFG.options,
          onHover: (e) => {
            tooltipHanlder({
              chart: chart,
              tooltip: chart.tooltip,
            });
          },
        },
        plugins: [
          {
            id: `${type}MouseOut`,
            beforeEvent(chart, args, pluginOptions) {
              const event = args.event;
              if (event.type === "mouseout") {
                // reset chart to current state
                setTimeout(() => {
                  tooltipHanlder({ chart, tooltip: chart.tooltip });
                  const rateTooltip = document.querySelector(`#${type}TooltipId`);
                  const left =
                    ((chart.width - chart.chartArea.left) * defaultTooltipIndex) /
                      DATA_POINTS_LEN +
                    chart.chartArea.left;
                  rateTooltip.style.left = `${left}px`;
                  onMoveOut(chart);
                }, 0);
              }
            },
          },
        ]
      });

      if (type === "priceRate") {
        chart.options.scales.x.ticks.callback = function (value, index) {
          return index % 80 === 0 || index === DATA_POINTS_LEN + 1
            ? (this.getLabelForValue(value) * 1).toFixed(4)
            : null;
        };
        chart.options.scales.y.max = 0.08;
        chart.options.scales.x.title = {
          display: true,
          text: "crvUSD price",
        };
      } else {
        chart.options.scales.y.max = 0.1;
        chart.options.scales.x.title = {
          display: true,
          text: "DebtFraction",
        };
      }
    } else {
      chart.data = { ...data };
      chart.update();
    }

    if (!chart.tooltip.getActiveElements().length && defaultTooltipIndex > -1) {
      let title = "";
      let value = "";
      const _data = chart.data.datasets[0].data;
      if (type === "fractionRate") {
        title = `fraction: ${(data.labels[defaultTooltipIndex] * 100).toFixed(
          2
        )}%`;
        value = `rate: ${(_data[defaultTooltipIndex] * 100).toFixed(2)}%`;
      } else if (type === "priceRate") {
        title = `price: ${(data.labels[defaultTooltipIndex] * 1).toFixed(4)}`;
        value = `rate: ${(_data[defaultTooltipIndex] * 100).toFixed(2)}%`;
      }

      const {
        ctx,
        chartArea: { top, bottom, left, right },
        scales: { x, y },
        canvas: { offsetLeft },
      } = chart;

      externalTooltipHandler(
        { chart, tooltip: chart.tooltip },
        `${type}TooltipId`,
        title,
        value,
        tooltipHead2,
        defaultTooltipIndex
      );
      const rateTooltip = document.querySelector(`#${type}TooltipId`);
      rateTooltip.style.left = `${
        offsetLeft + x.getPixelForValue(defaultTooltipIndex)
      }px`;
      rateTooltip.style.top = `50%`;
    }
  }, [renderTimeoutId, data, defaultTooltipIndex]);


  return (
    <div className="chart-container">
      <canvas
        id={`${type}ChartId`}
        ref={chartRef}
        width={600}
        height={320}
      ></canvas>
    </div>
  );
}
