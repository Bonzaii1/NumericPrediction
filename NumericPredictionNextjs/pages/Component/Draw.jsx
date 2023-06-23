import styles from '../../styles/Home.module.css';
import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

export default function Draw() {
  let guess = '';
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight;
    canvas.style.width = `${window.innerWidth / 4}px`;
    canvas.style.height = `${window.innerHeight / 2}px`;
    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = 'black';
    context.lineWidth = 8;
    contextRef.current = context;
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);

    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const evaluate = async () => {
    //import model
    const model = await tf.loadLayersModel('../../model.json');

    //set image to a variable
    const canvas = canvasRef.current;
    canvas.height = '28';
    canvas.width = '28';
    var image = canvas.toDataURL('image/png');

    //turn image to a tensor
    let tfTensor = tf.browser.fromPixels(image);
    tfTensor = tfTensor.div(255.0);
    tfTensor = tfTensor.expandDims(0);
    tfTensor = tfTensor.cast('float32');

    //run image through model
    const pred = model.predict(tfTensor);

    console.log(pred);
  };

  const reset = () => {
    console.log('hello');
    const canvas = canvasRef.current;

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  };
  return (
    <div>
      <div>
        <canvas
          className={styles.draw}
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          ref={canvasRef}
        />
      </div>
      <h2 className={styles.description}>
        I believe the number you drew is : {guess}
      </h2>
      <button onClick={evaluate}>Evaluate</button>
      <button onClick={reset}>Clear</button>
    </div>
  );
}
