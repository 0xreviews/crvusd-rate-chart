import { CHART_COLORS, DATA_POINTS_LEN } from "./chartConfig";

export const getOrCreateTooltip = (chart, id) => {
  let tooltipEl = chart.canvas.parentNode.querySelector(`#${id}`);

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.id = id;
    tooltipEl.className = "tooltip";

    const {top, bottom} = chart.chartArea;

    const table = document.createElement("table");
    table.className = "tooltip-table";

    const axisLine = document.createElement("div");
    axisLine.className = "tooltip-axisLine";
    axisLine.style = `
        top: -${(bottom - top) * 0.62}px;
        height: ${(bottom - top)}px;
        border-color: ${CHART_COLORS.blue};
    `;

    // const axisDot = document.createElement("div");
    // axisDot.className = "tooltip-dot";
    // axisDot.id = `${id}_dot`

    tooltipEl.appendChild(axisLine);
    // tooltipEl.appendChild(axisDot);
    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

export const getOrCreateVerticleLine = (chart, id) => {
  let verticeLineEl = chart.canvas.parentNode.querySelector(`#${id}`);

  if (!verticeLineEl) {
    verticeLineEl = document.createElement("div");
    verticeLineEl.id = id;
    verticeLineEl.className = "default-dashLine";

    chart.canvas.parentNode.appendChild(verticeLineEl);
  }

  return verticeLineEl;
};


export const externalTooltipHandler = (
  context,
  tooltipId,
  title,
  value,
  value2,
  defaultTooltipIndex,
) => {
  // Tooltip Element
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart, tooltipId);
  const verticleLinepEl = getOrCreateVerticleLine(chart, tooltipId+'_verticleLine');

  // Set Text
  const tableHead = document.createElement("thead");
  {
    const tr = document.createElement("tr");
    tr.style.borderWidth = 0;

    const th = document.createElement("th");
    th.style.borderWidth = 0;

    const text = document.createTextNode(title);

    th.appendChild(text);
    tr.appendChild(th);
    tableHead.appendChild(tr);
  }

  {
    const tr = document.createElement("tr");
    tr.style.backgroundColor = "inherit";
    tr.style.borderWidth = 0;

    const td = document.createElement("td");
    td.style.borderWidth = 0;

    const text = document.createTextNode(value2);

    td.appendChild(text);
    tr.appendChild(td);
    tableHead.appendChild(tr);
  }

  const tableBody = document.createElement("tbody");
  {
    const tr = document.createElement("tr");
    tr.style.backgroundColor = "inherit";
    tr.style.borderWidth = 0;

    const td = document.createElement("td");
    td.style.borderWidth = 0;

    const text = document.createTextNode(value);

    td.appendChild(text);
    tr.appendChild(td);
    tableBody.appendChild(tr);
  }

  const tableRoot = tooltipEl.querySelector("table");

  // Remove old children
  while (tableRoot.firstChild) {
    tableRoot.firstChild.remove();
  }

  // Add new children
  tableRoot.appendChild(tableHead);
  tableRoot.appendChild(tableBody);

  const {
    ctx,
    chartArea: { top, bottom, left, right },
    scales: { x, y },
    canvas: { offsetLeft, offsetTop },
  } = chart;

  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = offsetLeft + tooltip.caretX + "px";
  tooltipEl.style.top = offsetTop + tooltip.caretY + "px";
  tooltipEl.style.font = tooltip.options.bodyFont.string;

  // set axis-dot position
  // if (tooltip.dataPoints) {
  //   const axisDot = document.querySelector(`#${tooltipId}_dot`)
  //   axisDot.style.top =y.getPixelForValue(tooltip.dataPoints[0].dataIndex) + "px"
  // }

  // draw vertical line of current on-chain data
  if (defaultTooltipIndex > -1) {
    verticleLinepEl.style.top = offsetTop + top + "px";
    verticleLinepEl.style.height = (bottom - top) + "px";
    // verticleLinepEl.style.bottom = offsetTop + bottom + "px";
    verticleLinepEl.style.left = offsetLeft + x.getPixelForValue(defaultTooltipIndex) + "px";
  }
};
