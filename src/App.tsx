import { useEffect, useRef, useState } from 'react';
import './App.css';

const WIDTH = 500;
const HEIGHT = 100;

function App() {
  const [file, setFile] = useState<File | undefined>();
  const [content, setContent] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>();
  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    if (!file) {
      return;
    }

    const loadFile = async () => {
      const audio = await file.arrayBuffer();

      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();

      const decoded = await audioCtx.decodeAudioData(audio);
      const source = audioCtx.createBufferSource();
      source.buffer = decoded;

      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      source.start();

      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvasCtx = canvasRef.current?.getContext("2d")!;
      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

      function draw() {
        var drawVisual = requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        canvasCtx.beginPath();

        var sliceWidth = WIDTH * 1.0 / bufferLength;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {

          var v = dataArray[i] / 128.0;
          var y = v * HEIGHT / 2;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(WIDTH, HEIGHT / 2);
        canvasCtx.stroke();
      };

      draw();
    }

    loadFile();
  }, [file]);

  return (
    <div className="App">
      {/* @ts-ignore */}
      <input type="file" ref={fileRef} onChange={(e) => {
        console.log(e.target.files)
        setFile((e.target.files ?? [])[0]);
      }} />
      {/* @ts-ignore */}
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT}></canvas>
    </div>
  );
}

export default App;
