import React, { useEffect, useRef } from "react";
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
    ctx.strokeStyle = "blue";
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
    return window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    initStyle();

    function onListenMouseDown(x, y) {
      painting.current = true;
      startPoint.current = { x, y };
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }

    function onListenMouseMove(x, y) {
      if (painting.current) {
        endPoint.current = { x, y };
        ctx.moveTo(startPoint.current.x, startPoint.current.y);
        ctx.lineTo(endPoint.current.x, endPoint.current.y);
        ctx.stroke();
        ctx.closePath();
        startPoint.current = endPoint.current;
      }
    }

    canvas.onmousedown = function (e) {
      onListenMouseDown(e.clientX, e.clientY);
    };
    canvas.ontouchstart = function (e) {
      onListenMouseDown(e.touches[0].clientX, e.touches[0].clientY);
    };

    canvas.onmousemove = function (e) {
      window.requestAnimationFrame(() =>
        onListenMouseMove(e.clientX, e.clientY)
      );
    };
    canvas.ontouchmove = function (e) {
      e.preventDefault();
      window.requestAnimationFrame(() =>
        onListenMouseMove(e.touches[0].clientX, e.touches[0].clientY)
      );
    };
    canvas.onmouseup = function (e) {
      onRemoveState();
    };
    canvas.ontouchend = function (e) {
      onRemoveState();
    };
  });

  return (
    <div className="Home">
      <ul className="panel">
        <li onClick={onClearScreen}>清屏</li>
        <li onClick={onSaveImg}>导出</li>
      </ul>

      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default Home;
