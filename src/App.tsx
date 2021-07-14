import { useEffect, useRef, useState } from 'react';
import './App.css';

const readFile = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    }
    reader.onerror = () => {
      reject('Failed to read');
    }

    reader.readAsText(file);
  })
}

function App() {
  const [file, setFile] = useState<File | undefined>();
  const [content, setContent] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>();

  useEffect(() => {
    if (!file) {
      return;
    }

    const loadFile = async () => {
      try {
        const fileContent = await readFile(file);
        setContent(fileContent);
      }
      catch (e) {
        console.error(e);
      }
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
      <div>{content}</div>
    </div>
  );
}

export default App;
