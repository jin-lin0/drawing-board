import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineClear, AiTwotoneSave } from "react-icons/ai";
import { BsFillEraserFill } from "react-icons/bs";
import { colorPanelConfig } from "./config";
import "./index.less";

/** @type {HTMLCanvasElement} */
const Home = () => {
  const canvasRef = useRef(null);
  const painting = useRef(false);
  const clearing = useRef(false);
  const points = useRef([]);
  const [activeItem, setActiveItem] = useState(-1);
  const [status, setStatus] = useState("paint");
  const [lineWidth, setLineWidth] = useState(5);

  function initStyle() {
    const canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  const getMidPoint = (start, end) => {
    return {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };
  };

  const onRemoveState = () => {
    points.current = [];
    painting.current = false;
    clearing.current = false;
  };

  const onClearScreen = () => {
    onRemoveState();
    const canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStatus("paint");
  };

  const onSaveImg = () => {
    const canvas = canvasRef.current;
    let imgUrl = canvas.toDataURL("image/png");
    let exportDOM = document.createElement("a");
    document.body.appendChild(exportDOM);
    exportDOM.href = imgUrl;
    exportDOM.download = "DrawingBoard_" + new Date().getTime() + ".png";
    exportDOM.target = "__blank";
    exportDOM.click();
    // todo 移动端下载
    // let img = new Image();
    // img.src = imgUrl;
    // document.body.appendChild(img);
  };
  const onActiveEraser = () => {
    setStatus("eraser");
    setActiveItem("eraser");
  };

  const onChooseColor = (e) => {
    const canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = e.target.value;
    setStatus("paint");
    setActiveItem("color");
  };

  const onChangeLineWidth = (e) => {
    const canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    ctx.lineWidth = e.target.value;
    setLineWidth(e.target.value);
  };

  const onChooseSpecialColor = (hex) => {
    const canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = hex;
    setStatus("paint");
  };

  const onListenMouseDown = (x, y) => {
    let ctx = canvasRef.current.getContext("2d");
    if (status === "eraser") {
      clearing.current = true;
      // ctx.globalCompositeOperation = "destination-out";
      ctx.clearRect(x - lineWidth / 2, y - lineWidth / 2, lineWidth, lineWidth);
    } else {
      painting.current = true;
      points.current = [...points.current, { x, y }];
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  };

  const onListenMouseMove = (x, y) => {
    let ctx = canvasRef.current.getContext("2d");

    window.requestAnimationFrame(() => {
      if (painting.current) {
        points.current = [...points.current, { x, y }];
        if (points.current.length >= 3) {
          const lastPoints = points.current.slice(-3);
          const [start, control, last] = lastPoints;
          const startPoint = getMidPoint(start, control);
          const lastPoint = getMidPoint(last, control);
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.quadraticCurveTo(control.x, control.y, lastPoint.x, lastPoint.y);
          ctx.stroke();
          ctx.closePath();
        }
      }
      if (clearing.current) {
        ctx.clearRect(
          x - lineWidth / 2,
          y - lineWidth / 2,
          lineWidth,
          lineWidth
        );
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    function onResize() {
      let canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = document.documentElement.clientWidth;
      canvas.height = document.documentElement.clientHeight;
      //todo 颜色/粗细会丢失
      ctx.putImageData(canvasData, 0, 0);
    }
    // window.onresize = onResize;
    document.body.addEventListener("touchmove", (e) => e.preventDefault(), {
      passive: false,
    });
    return window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let canvas = canvasRef.current;
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    initStyle();
  }, []);

  return (
    <div className="Home">
      <ul className="panel">
        <input type="color" onChange={onChooseColor} onClick={onChooseColor} />
        {colorPanelConfig.map((item, index) => (
          <div
            key={index}
            className={classNames([
              "color-item",
              `color-item-${item.name}`,
              { "color-item-active": item.name === activeItem },
            ])}
            onClick={() => {
              onChooseSpecialColor(item.color);
              setActiveItem(item.name);
            }}
          ></div>
        ))}
        <li onClick={onActiveEraser}>
          <BsFillEraserFill />
        </li>
        <li onClick={onClearScreen}>
          <AiOutlineClear />
        </li>
        <li onClick={onSaveImg}>
          <AiTwotoneSave />
        </li>

        <select
          className="lineWidth"
          value={lineWidth}
          onChange={onChangeLineWidth}
        >
          <option value={50}>50</option>
          <option value={20}>20</option>
          <option value={10}>10</option>
          <option value={5}>5</option>
          <option value={2}>2</option>
          <option value={1}>1</option>
        </select>
      </ul>

      <canvas
        ref={canvasRef}
        onMouseDown={(e) => onListenMouseDown(e.clientX, e.clientY)}
        onTouchStart={(e) =>
          onListenMouseDown(e.touches[0].clientX, e.touches[0].clientY)
        }
        onMouseUp={onRemoveState}
        onTouchEnd={onRemoveState}
        onMouseMove={(e) => {
          onListenMouseMove(e.clientX, e.clientY);
        }}
        onTouchMove={(e) => {
          onListenMouseMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
      ></canvas>
    </div>
  );
};

export default Home;
