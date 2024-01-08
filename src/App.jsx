import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState } from "react";

// Styles + Logo UNL 
import viteLogo from "/unl.svg";
import "./App.css";


function App() {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const [data, setData] = useState(undefined);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagen, setImagen] = useState("");
 

  async function ObtenerDatosDeGemini() {
    try {
      if (!inputText) {
        alert("Ingresa una entrada");
        return;
      }
      setLoading(true);
      const genAI = new GoogleGenerativeAI(API_KEY);
      const fileInputEl = document.querySelector("input[type=file]");
  
      if (fileInputEl && fileInputEl.files.length > 0) { //SI hay una imagen cargada usa gemini-pro-VISION
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        const imageParts = await Promise.all(
          [...fileInputEl.files].map(fileToGenerativePart)
        );
        const result = await model.generateContent([inputText, ...imageParts]);
        const text = result.response.text();
        setData(text);
      } else {                                            //SI NO hay una imagen cargada usa gemini-pro
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(inputText);
        const text = result.response.text();
        setData(text);
      }
    } catch (error) {
      console.error("error en ObtenerDatosDeGemini : ", error);
    } finally {
      setLoading(false);
    }
  }
  

  async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      ObtenerDatosDeGemini();
    }
  };
  return (
    <>
      <nav className="unl">
        <img
          src={viteLogo}
          className="logo"
          style={{ width: '90px', height: 'auto' }}
          alt="Gemini Universidad Nacional de Loja" /> 
      </nav>
        {imagen && <img src={imagen} alt="Imagen" style={{ maxWidth: '100px' }} />}
        <br />
        <input type="file" />
        <input
          type="text"
          style={{ width: 432, height: 30, textAlign: "center" }}
          value={inputText}
          onKeyDown={handleKeyDown}
          onChange={(e) => setInputText(e.target.value)}/>
        {" | "}
        <button disabled={loading} onClick={() => ObtenerDatosDeGemini()}>
          {loading ? "Procesando..." : "Procesar"}
        </button>
        <hr />
        
      <div className="card">
        <div> <p style={{ border: '30px', backgroundColor: '#101010', textAlign: "left  " }}>{data}</p></div>
      </div>
    </>
  );
}

export default App;