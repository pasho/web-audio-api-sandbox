import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';

const WIDTH = 500;
const HEIGHT = 100;

const visualizeWave = async (file: File, canvas: HTMLCanvasElement) => {
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

  const canvasCtx = canvas.getContext("2d")!;
  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

  function draw() {
    requestAnimationFrame(draw);

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

const visualizeFrequencies = async (file: File, canvas: HTMLCanvasElement) => {
  const audio = await file.arrayBuffer();

  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();

  const decoded = await audioCtx.decodeAudioData(audio);
  const source = audioCtx.createBufferSource();
  source.buffer = decoded;

  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  source.start();

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const canvasCtx = canvas.getContext("2d")!;
  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

  function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2;

      canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
      canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  draw();
}

function App() {
  const [file, setFile] = useState<File | undefined>();
  const fileRef = useRef<HTMLInputElement>();
  const waveCanvasRef = useRef<HTMLCanvasElement>();
  const freqCanvasRef = useRef<HTMLCanvasElement>();

  const visualize = useCallback(async () => {

    if (!file || !waveCanvasRef.current || !freqCanvasRef.current) {
      return;
    }
    visualizeWave(file, waveCanvasRef.current);
    visualizeFrequencies(file, freqCanvasRef.current);
  }, [file]);

  useEffect(() => {
    visualize();
  }, [file, visualize]);

  return (
    <div className="App">
      {/* @ts-ignore */}
      <input type="file" ref={fileRef} onChange={(e) => {
        console.log(e.target.files)
        setFile((e.target.files ?? [])[0]);
      }} />
      {/* @ts-ignore */}
      <canvas ref={waveCanvasRef} width={WIDTH} height={HEIGHT}></canvas>
      {/* @ts-ignore */}
      <canvas ref={freqCanvasRef} width={WIDTH} height={HEIGHT}></canvas>
    </div>
  );
}

export default App;
