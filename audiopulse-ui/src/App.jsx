import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Conexión directa a tu API local de FastAPI
      const response = await fetch('http://127.0.0.1:8000/api/v1/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al procesar el audio cardíaco.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Navbar de la Aplicación */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-pulse-500 text-white p-2 rounded-lg animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-xl text-slate-900 tracking-tight">AudioPulse AI</h1>
              <p className="text-xs text-slate-500 font-medium">Cardiovascular Acoustic Intelligence</p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-health-100 text-health-900">
            API Online
          </span>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-grow max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Columna Izquierda: Panel de Carga */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Análisis de Fonocardiograma</h2>
            <p className="text-sm text-slate-500 mb-6">Suba una grabación de audio en formato WAV proveniente de un estetoscopio digital para iniciar el tamizaje algorítmico.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 hover:border-health-500 rounded-xl p-8 text-center bg-slate-50 transition cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".wav" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <p className="text-sm font-semibold text-slate-700">
                  {file ? file.name : "Seleccionar archivo .wav"}
                </p>
                <p className="text-xs text-slate-400 mt-1">Formatos de audio biométricos nativos</p>
              </div>

              <button
                type="submit"
                disabled={!file || loading}
                className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-md transition duration-200 flex items-center justify-center space-x-2 ${
                  !file || loading 
                    ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                    : 'bg-health-600 hover:bg-health-500 active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analizando Huella Acústica...</span>
                  </>
                ) : (
                  <span>Iniciar Diagnóstico Asistido</span>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-pulse-50 border border-pulse-100 rounded-xl flex items-start space-x-3 text-pulse-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pulse-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Columna Derecha: Resultados */}
          <div className="space-y-6">
            {result ? (
              <div className={`p-6 rounded-2xl shadow-md border animate-fadeIn bg-white ${
                result.prediction_code === 0 ? 'border-health-100' : 'border-pulse-100'
              }`}>
                <h3 className="text-md font-bold text-slate-500 uppercase tracking-wider mb-4">Resultado del Screening</h3>
                
                {/* Badge de Diagnóstico */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`p-4 rounded-xl ${
                    result.prediction_code === 0 ? 'bg-health-100 text-health-600' : 'bg-pulse-100 text-pulse-600'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Clasificación</div>
                    <div className={`text-2xl font-black ${
                      result.prediction_code === 0 ? 'text-health-600' : 'text-pulse-600'
                    }`}>
                      {result.diagnosis}
                    </div>
                  </div>
                </div>

                {/* Barra de Probabilidad */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm font-bold text-slate-600">
                    <span>Certeza del Modelo Algorítmico</span>
                    <span>{(result.probability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        result.prediction_code === 0 ? 'bg-health-500' : 'bg-pulse-500'
                      }`}
                      style={{ width: `${result.probability * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Enlace de AWS S3 */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">Persistencia en la Nube</div>
                  <a 
                    href={result.s3_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 text-sm text-sky-600 hover:text-sky-700 font-semibold underline break-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5 5 0 00-4.591-2.941A1 1 0 0010 7v1a4 4 0 00-4 4v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1H7a3 3 0 013-3V5a5 5 0 014.9 4.1 1 1 0 00.9.9h.2A3 3 0 0113 16H7a3 3 0 01-3-3V15z" />
                    </svg>
                    <span>Ver archivo de auditoría en AWS S3</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 bg-white h-full flex flex-col justify-center items-center py-16 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-semibold">Esperando Señal Acústica</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Los resultados del diagnóstico asistido por IA aparecerán en este panel tras procesar el archivo.</p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs font-medium text-slate-400">
        <p>© 2026 AudioPulse AI — Desarrollado bajo especificaciones de Ingeniería de Sistemas y Salud Digital.</p>
      </footer>
    </div>
  );
}

export default App;