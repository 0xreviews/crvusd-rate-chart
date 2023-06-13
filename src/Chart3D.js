import Plotly from "plotly.js-dist-min";
import { useEffect, useState } from "react";
import { calculate_rate_yearly } from "./calcRate";
import { DATA_POINTS_LEN, END_PRICE, START_PRICE } from "./chartConfig";

const DATA_LEN = 20;
const priceStep = (END_PRICE - START_PRICE) / DATA_LEN;
const fractionStep = (0.5 - 0) / DATA_LEN;

function surfaceRender(price, fraction, totalDebt) {
  // X price, Y fraction, Z rate
  let X = [];
  let Y = [];
  let Z = [];
  let z_data = [];
  let act_price_curve = { x: [], y: [], z: [] };
  let act_fraction_curve = { x: [], y: [], z: [] };

  for (let i = 0; i <= DATA_LEN; i++) {
    X.push(START_PRICE + i * priceStep);
    Y.push(0 + i * fractionStep);
  }

  let f = 0;
  while (f <= 0.5) {
    z_data.push([]);
    let p = START_PRICE;
    while (p <= END_PRICE) {
      let _z = calculate_rate_yearly(p, f * totalDebt, totalDebt);

      z_data[z_data.length - 1].push(_z);
      Z.push(_z);

      p += priceStep;
    }
    f += fractionStep;
  }

  // current active curve (price)
  {
    let act_p = START_PRICE;
    while (act_p <= END_PRICE) {
      let _z = calculate_rate_yearly(act_p, fraction * totalDebt, totalDebt);
      act_price_curve.x.push(act_p);
      act_price_curve.y.push(fraction);
      act_price_curve.z.push(_z + 0.0005);
      act_p += priceStep;
    }
  }

  // current active curve (fraction)
  {
    let f = 0;
    while (f <= 0.5) {
      let _z = calculate_rate_yearly(price, f * totalDebt, totalDebt);
      act_fraction_curve.x.push(price);
      act_fraction_curve.y.push(f);
      act_fraction_curve.z.push(_z + 0.0005);
      f += fractionStep;
    }
  }

  let data = [
    {
      name: "rate surface",
      type: "surface",
      x: X,
      y: Y,
      z: z_data,
      colorscale: [
        [0, "rgba(230,230,230, 0.85)"],
        [1, "rgba(180,180,180, 0.85)"],
      ],
      showscale: false,
      hoverinfo: 'none',
      showlegend: false,
      // hovertemplate: "price: %{x:$.4f}<br>fraction: %{y:.2%}<br>rate: %{z:.2%}",
      // hoverlabel: {
      //   align: "left",
      // },
      contours: {
        // x: {
        //   show: true,
        //   color: "rgb(240,240,240)",
        // },
        // y: {
        //   show: true,
        //   color: "rgb(240,240,240)",
        // },
      },
    },
    {
      name: "rate curve(price)",
      type: "scatter3d",
      mode: "lines",
      ...act_price_curve,
      hoverinfo: 'none',
      showlegend: false,
      line: {
        opacity: 1,
        width: 6,
        dash: "solid",
        color: "rgb(153, 102, 255)",
      },
    },
    {
      name: "rate curve(fraction)",
      type: "scatter3d",
      mode: "lines",
      ...act_fraction_curve,
      hoverinfo: 'none',
      showlegend: false,
      line: {
        opacity: 1,
        width: 6,
        dash: "solid",
        color: "rgb(75, 192, 192)",
      },
    },
    // {
    //   name: "current rate",
    //   type: "scatter3d",
    //   mode: "markers",
    //   x: [1.0],
    //   y: [0.14],
    //   z: [calculate_rate_yearly(1.0, 0.14 * totalDebt, totalDebt)],
    // showlegend: false,
    //   marker: {
    //     color: "rgb(127, 127, 127)",
    //     size: 12,
    //     symbol: "circle",
    //     color: "rgb(255, 99, 132)",
    //     opacity: 0.8,
    //   },
    //   surfaceaxis: "012",
    // },
  ];

  let layout = {
    // title: "Mt Bruno Elevation",
    autosize: false,
    width: 500,
    height: 500,
    margin: {
      l: 40,
      r: 0,
      b: 20,
      t: 0,
    },
    scene: {
      camera: {
        eye: {
          x: 0.5,
          y: 2,
          z: 0.2,
        },
      },
      xaxis: {
        title: {
          text: "price",
        },
        showspikes: false,
      },
      yaxis: {
        title: {
          text: "fraction",
        },
        showspikes: false,
        tickformat: ".2%",
      },
      zaxis: {
        title: {
          text: "rate",
        },
        showspikes: false,
        tickformat: ".2%",
      },
    },
    ternary: {
      aaxis: {
        color: "#fff",
      },
    },
  };

  Plotly.newPlot("chart3D", data, layout);
}

export function Chart3D({ fraction, price, rate, totalDebt, onHover, onHoverOut }) {
  const [hovering, setHovering] = useState(false);
  const [hoverPrice, setHoverPrice] = useState(1.0);
  const [hoverFraction, setHoverFration] = useState(0.14);
  const [hoverRate, setHoverRate] = useState(
    calculate_rate_yearly(hoverPrice, hoverFraction * totalDebt, totalDebt)
  );

  useEffect(() => {
    if (!price || !fraction || !totalDebt) return;
    let r = calculate_rate_yearly(price, fraction * totalDebt, totalDebt)
    setHoverPrice(price);
    setHoverFration(fraction);
    setHoverRate(r)
    surfaceRender(price, fraction, totalDebt);
    setTimeout(() => {
      const chart3D = document.querySelector("#chart3D");
      chart3D
        .on("plotly_hover", function (data) {
          if (data.points) {
            const {
              x: hoverPrice,
              y: hoverFraction,
              z: hoverRate,
            } = data.points[0];
            onHover({ hoverPrice, hoverFraction, hoverRate });
            setHoverPrice(hoverPrice);
            setHoverFration(hoverFraction);
            setHoverRate(hoverRate);
            setHovering(true);
          }
        })
        .on("plotly_unhover", function (data) {
          onHoverOut({ hoverPrice: price, hoverFraction: fraction, hoverRate: 0 });
          setHoverPrice(price);
          setHoverFration(fraction);
          setHoverRate(rate);
          setHovering(false);
        });
    }, 10);
  }, [price, fraction, totalDebt]);
  return (
    <div className="chart-3D-container">
      <div id="chart3D" className="chart-3D" width={500} height={500}></div>
      <ul className="chart-3D-hoverinfo">
        <li>crvUSD price: ${hoverPrice.toFixed(4)}</li>
        <li>DebtFraction: {(hoverFraction * 100).toFixed(2)}%</li>
        <li>rate: {(hoverRate * 100).toFixed(2)}%</li>
      </ul>
    </div>
  );
}
