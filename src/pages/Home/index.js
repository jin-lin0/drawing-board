import React, { useEffect, useRef, useState } from "react";
import "./index.css";

/** @type {HTMLCanvasElement} */
const Home = () => {
  const canvasRef = useRef(null);
  const painting = useRef(false);
  const startPoint = useRef({ x: undefined, y: undefined });
  const endPoint = useRef({ x: undefined, y: undefined });

  function initStyle() {
    const canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  const onRemoveState = () => {
    painting.current = false;
    startPoint.current = null;
    endPoint.current = null;
  };

  const onClearScreen = () => {
    onRemoveState();
    const canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    // todo 移动端
    // let img = new Image();
    // img.src = imgUrl;
    // document.body.appendChild(img);
  };

  const onChooseColor = (e) => {
    const canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = e.target.value;
  };

  const onListenMouseDown = (x, y) => {
    let ctx = canvasRef.current.getContext("2d");
    painting.current = true;
    startPoint.current = { x, y };
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  };

  const onListenMouseMove = (x, y) => {
    window.requestAnimationFrame(() => {
      let ctx = canvasRef.current.getContext("2d");
      if (painting.current) {
        endPoint.current = { x, y };
        ctx.moveTo(startPoint.current.x, startPoint.current.y);
        ctx.lineTo(endPoint.current.x, endPoint.current.y);
        ctx.stroke();
        ctx.closePath();
        startPoint.current = endPoint.current;
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
      initStyle();
      ctx.putImageData(canvasData, 0, 0);
    }
    window.onresize = onResize;
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
  }, [canvasRef.current]);

  return (
    <div className="Home">
      <ul className="panel">
        <li onClick={onClearScreen}>清屏</li>
        <li onClick={onSaveImg}>导出</li>
        <input type="color" onChange={onChooseColor} />
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
