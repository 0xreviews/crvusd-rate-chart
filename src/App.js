import { useEffect, useRef, useState } from "react";
import { calculate_rate_yearly } from "./calcRate";
import "./App.css";
import LogoSVG from "./logo.svg"
import { externalTooltipHandler } from "./tooltip";
import {
  processFractionRateData,
  processPriceRateData,
  searchLabelIndex,
} from "./chartConfig";
import LineChart from "./LineChart";

import fomulaImg from "./crvusd-rate-fomula.png";
import {
  callPegKeepersDebt,
  callStablePrice,
  callTotalDebt,
} from "./callContract";
import { Chart3D } from "./Chart3D";

function App() {
  const [totalDebt, setTotalDebt] = useState(10000);
  const [pkDebt, setPkDebt] = useState(1400);
  const [fraction, setFraction] = useState(pkDebt / totalDebt);
  const [price, setPrice] = useState(1.0);

  const [fractionRateDefaultIndex, setFractionRateDefaultIndex] = useState(-1);
  const [priceRateDefaultIndex, setPriceRateDefaultIndex] = useState(-1);

  const [hoverFraction, setHoverFraction] = useState(fraction);
  const [hoverPrice, setHoverPrice] = useState(price);
  const [hoverRate, setHoverRate] = useState(
    calculate_rate_yearly(price, fraction * totalDebt, totalDebt)
  );

  const [fractionRateData, setFractionRateData] = useState(null);
  const [priceRateData, setPriceRateData] = useState(null);

  const [actDesc, setActDesc] = useState("");
  const [renderTimeoutId, setRenderTimeoutId] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  async function callContractData() {
    const [p, totalDebt, pkDebt] = await Promise.all([
      callStablePrice(),
      callTotalDebt(),
      callPegKeepersDebt(),
    ]);

    setPrice(p);
    setHoverPrice(p);
    setTotalDebt(totalDebt);
    setPkDebt(pkDebt);

    const f = pkDebt / totalDebt;
    setFraction(f);
    setHoverFraction(f);
    console.log(
      `call contract res: p ${p} totalDebt ${totalDebt} price ${price} fraction ${f}`
    );
  }

  useEffect(() => {
    callContractData();
  }, []);

  function priceRateTooltipHandler(chart) {
    let title = `price: ${price.toFixed(4)}`;
    let value = `rate: ${(hoverRate * 100).toFixed(4)}%`;

    if (chart.tooltip.opacity === 0) {
      setHoverPrice(price);
    } else {
      const titleLines = chart.tooltip.title || [];
      if (titleLines[0]) {
        let _p = Number(titleLines[0]);
        title = `price: ${_p.toFixed(4)}`;
        setHoverPrice(_p);
      }

      const bodyLines = chart.tooltip.body.map((b) => b.lines) || [];
      if (bodyLines[0]) {
        let r = Number(bodyLines[0].join("").split(": ")[1]);
        value = `rate: ${(r * 100).toFixed(2)}%`;
        setHoverRate(r);
      }
    }

    if (chart.tooltip.dataPoints) {
      const index = chart.tooltip.dataPoints[0].dataIndex;
      if (index < 0) {
        setActDesc("");
        return;
      }
      if (index < priceRateDefaultIndex) {
        setActDesc("0");
      } else {
        setActDesc("1");
      }
    }

    externalTooltipHandler(
      chart,
      "priceRateTooltipId",
      title,
      value,
      `fraction: ${(fraction * 100).toFixed(0)}%`,
      priceRateDefaultIndex
    );
  }

  useEffect(() => {
    if (renderTimeoutId) clearTimeout(renderTimeoutId);
    let id = setTimeout(() => {
      let _priceRateData = processPriceRateData(
        hoverFraction * totalDebt,
        totalDebt
      );
      setPriceRateData(_priceRateData);
    }, 20);
    setRenderTimeoutId(id);
  }, [hoverFraction]);

  useEffect(() => {
    if (priceRateData) {
      let _priceRateIndex = searchLabelIndex(
        price,
        priceRateData.labels,
        0.00005
      );
      if (_priceRateIndex > -1) setPriceRateDefaultIndex(_priceRateIndex);
    }
  }, [price, fraction, fractionRateData, priceRateData]);

  useEffect(() => {
    let _priceRateData = processPriceRateData(
      hoverFraction * totalDebt,
      totalDebt
    );
    setPriceRateData(_priceRateData);
  }, []);

  return (
    <div className="App">
      <div>
        <a href="https://0xreviews.xyz/" className="logo">
          <span className="arrow">&larr;</span>
          <img className="logo-svg" src={LogoSVG} />
          <span>
            back to <span className="font-bold">0xreviews.xyz</span>
          </span>
        </a>
      </div>
      <h2 className="title">crvUSD Rate Chart</h2>
      <div className="">
        <div>
          <p
            className={`desc-p ${
              actDesc.indexOf("0") < 0 ? "" : " desc-p-act"
            }`}
          >
            When crvUSD price goes lower, the rate goes higher.
          </p>
          <p
            className={`desc-p ${
              actDesc.indexOf("1") < 0 ? "" : " desc-p-act"
            }`}
          >
            When crvUSD price goes higher, the rate goes lower.
          </p>
          <p
            className={`desc-p ${
              actDesc.indexOf("2") < 0 ? "" : " desc-p-act"
            }`}
          >
            When DebtFraction goes lower, the rate goes higher.
          </p>
          <p
            className={`desc-p ${
              actDesc.indexOf("3") < 0 ? "" : " desc-p-act"
            }`}
          >
            When DebtFraction goes higher, the rate goes lower.
          </p>
        </div>
      </div>
      <label className="graph-toggle">
        <input
          type="checkbox"
          value={showAdvanced}
          onChange={(e) => {
            if (e.target) {
              if (e.target.value === "true") {
                setShowAdvanced(false);
              } else {
                setShowAdvanced(true);
              }
            }
          }}
        />
        Advanced 3D graph
      </label>
      <div className="layout">
        <div>
          <div className={`${showAdvanced ? "" : "hide"}`}>
            <Chart3D
              price={price}
              fraction={fraction}
              rate={calculate_rate_yearly(
                price,
                fraction * totalDebt,
                totalDebt
              )}
              totalDebt={totalDebt}
              onHover={({ hoverPrice, hoverFraction, hoverRate }) => {
                if (!!hoverPrice && !!hoverFraction && !!hoverRate) {
                  setHoverFraction(hoverFraction);
                  setHoverPrice(hoverPrice);
                  setHoverRate(hoverRate);
                  let str = "";
                  if (hoverPrice < price) {
                    str += "0";
                  } else {
                    str += "1";
                  }
                  if (hoverFraction < fraction) {
                    str += "2";
                  } else {
                    str += "3";
                  }
                  setActDesc(str);
                }
              }}
              onHoverOut={(data) => {
                setHoverFraction(fraction);
                setHoverPrice(price);
                setHoverRate(
                  calculate_rate_yearly(price, fraction * totalDebt, totalDebt)
                );
                setActDesc("");
              }}
            />
          </div>
          <div className={`${!showAdvanced ? "" : "hide"}`}>
            <div className="fraction-range">
              <span className="fraction-range-text">
                fraction: {(hoverFraction * 100).toFixed(2)}%
              </span>
              <input
                className="fraction-range-input"
                type="range"
                min={0}
                max={0.3}
                step={0.001}
                value={hoverFraction}
                onChange={(e) => {
                  if (e.target && e.target.value) {
                    const f = Number(e.target.value);
                    setHoverFraction(f);
                    if (f < fraction) {
                      setActDesc("2");
                    } else {
                      setActDesc("3");
                    }
                  }
                }}
                onMouseOut={(e) => {
                  setHoverFraction(fraction);
                  setActDesc("");
                }}
              />
            </div>
            <LineChart
              type={`priceRate`}
              defaultTooltipIndex={priceRateDefaultIndex}
              renderTimeoutId={renderTimeoutId}
              data={priceRateData}
              tooltipHead2={`fraction: ${(hoverFraction * 100).toFixed(2)}%`}
              tooltipHanlder={priceRateTooltipHandler}
              onMoveOut={() => {
                setActDesc("");
              }}
            />
          </div>
        </div>
      </div>

      <div className="layout">
        <table className="desc-table">
          <tbody>
            <tr>
              <td>crvUSDPrice</td>
              <td>${price.toFixed(4)}</td>
              <td>PegPrice</td>
              <td>$1.0000</td>
            </tr>
            <tr>
              <td>rate0</td>
              <td>10%</td>
              <td>sigma</td>
              <td>2%</td>
            </tr>
            <tr>
              <td>PegKeepersDebt</td>
              <td>{pkDebt.toFixed(2)}</td>
              <td>TotalDebt</td>
              <td>{totalDebt.toFixed(2)}</td>
            </tr>
            <tr>
              <td>DebtFraction</td>
              <td>{(fraction * 100).toFixed(1)}%</td>
              <td>TargetFraction</td>
              <td>10%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <img className="desc-img" src={fomulaImg} />
    </div>
  );
}

export default App;
