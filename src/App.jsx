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
  
  const manejarCambioArchivo = (event) => {
    const archivo = event.target.files[0];

    if (archivo) {
      const lector = new FileReader();

      lector.onload = function (e) {
        setImagen(e.target.result);
      };

      lector.readAsDataURL(archivo);
    }
  };
    document.addEventListener('DOMContentLoaded', () => {
      const startStopButton = document.getElementById('startStopButton');
      let mediaRecorder;
      let chunks = [];

      // Verifica la compatibilidad del navegador
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            // Crea un MediaRecorder con el stream de audio
            mediaRecorder = new MediaRecorder(stream);

            // Evento cuando se graba un fragmento de audio
            mediaRecorder.ondataavailable = (e) => {
              if (e.data.size > 0) {
                chunks.push(e.data);
              }
            };

            // Evento cuando la grabación se detiene
            mediaRecorder.onstop = () => {
              // Combina los fragmentos de audio en un blob
              const audioBlob = new Blob(chunks, { type: 'audio/wav' });

              // Puedes enviar el blob a un servidor o realizar otras acciones con él
              console.log('Grabación completa:', audioBlob);
              chunks = [];
            };

            // Agrega un listener al botón para iniciar/parar la grabación
            startStopButton.addEventListener('click', () => {
              if (mediaRecorder.state === 'inactive') {
                // Reinicia la grabadora si ya estaba grabando
                if (chunks.length > 0) {
                  chunks = [];
                  mediaRecorder = new MediaRecorder(stream);
                  mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                      chunks.push(e.data);
                    }
                  };
                }
                
                // Inicia la grabación
                mediaRecorder.start();
                startStopButton.textContent = 'Detener Grabación';
              } else {
                // Detiene la grabación
                mediaRecorder.stop();
                startStopButton.textContent = 'Iniciar Grabación';
              }
            });
          })
          .catch((error) => {
            console.error('Error al acceder al micrófono:', error);
          });
      } else {
        console.error('getUserMedia no está soportado en este navegador');
      }
    });
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
  
  document.addEventListener('DOMContentLoaded', () => {
    const startStopButton = document.getElementById('startStopButton');
    let mediaRecorder;
    let chunks = [];

    // Verifica la compatibilidad del navegador
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          // Crea un MediaRecorder con el stream de audio
          mediaRecorder = new MediaRecorder(stream);

          // Evento cuando se graba un fragmento de audio
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };

          // Evento cuando la grabación se detiene
          mediaRecorder.onstop = () => {
            // Combina los fragmentos de audio en un blob
            const audioBlob = new Blob(chunks, { type: 'audio/wav' });

            // Puedes enviar el blob a un servidor o realizar otras acciones con él
            console.log('Grabación completa:', audioBlob);
            chunks = [];
          };

          // Agrega un listener al botón para iniciar/parar la grabación
          startStopButton.addEventListener('click', () => {
            if (mediaRecorder.state === 'inactive') {
              // Reinicia la grabadora si ya estaba grabando
              if (chunks.length > 0) {
                chunks = [];
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = (e) => {
                  if (e.data.size > 0) {
                    chunks.push(e.data);
                  }
                };
              }
              
              // Inicia la grabación
              mediaRecorder.start();
              startStopButton.textContent = 'Detener Grabación';
            } else {
              // Detiene la grabación
              mediaRecorder.stop();
              startStopButton.textContent = 'Iniciar Grabación';
            }
          });
        })
        .catch((error) => {
          console.error('Error al acceder al micrófono:', error);
        });
    } else {
      console.error('getUserMedia no está soportado en este navegador');
    }
  });
  return (
    //  Logo: <nav className="unl"> <img src={viteLogo} className="logo" style={{ width: '90px', height: 'auto' }} alt="Gemini Universidad Nacional de Loja" /></nav>
    
    <> 
         {imagen && <img src={imagen} alt="Imagen" style={{ maxWidth: '100px' }} />}
        <br />

        <input
          type="text"
          style={{ width: 432, height: 30, textAlign: "center" }}
          value={inputText}
          onKeyDown={handleKeyDown}
          onChange={(e) => setInputText(e.target.value)}/>
        {" | "} 
        <button class="custom-button"id="startStopButton"></button> 

        <div class="custom-file-input"> 
          <label for="fileInput">Seleccionar Archivo</label> 
          <input type="file" id="fileInput" name="fileInput"onChange={manejarCambioArchivo}/>
        </div> 

        <button disabled={loading} onClick={() => ObtenerDatosDeGemini()}>
          {loading ? "Procesando..." : "Procesar"}
        </button>
        <hr /> 

        {data && (
        <div className="card">
          <div>
            <p style={{  textAlign: "left" }}>{data}</p>
          </div>
        </div>
      )}

    </>
  );
}


export default App;