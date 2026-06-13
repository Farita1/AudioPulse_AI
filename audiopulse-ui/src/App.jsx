import React, { useState, useEffect } from 'react';

export default function App() {
  // Estados para el formulario del paciente
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [file, setFile] = useState(null);

  // Estados para la respuesta del servidor e interfaz
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Estado para almacenar el historial de la Base de Datos
  const [history, setHistory] = useState([]);

  // Cargar el historial clínico al montar el componente
  const fetchHistory = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Error cargando el historial clínico:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cedula || !nombre || !edad || !file) {
      setError('Por favor, completa todos los campos del paciente y selecciona un archivo de audio.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('cedula', cedula);
    formData.append('nombre', nombre);
    formData.append('edad', parseInt(edad));
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al procesar el screening.');
      }

      const data = await response.json();
      setResult(data);
      
      // Insertar el nuevo registro al inicio del historial de forma reactiva
      setHistory((prevHistory) => [data, ...prevHistory]);
      
      // Limpiar formulario para el siguiente paciente
      setCedula('');
      setNombre('');
      setEdad('');
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Header Clínico */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse" />
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            AudioPulse AI <span className="text-xs text-slate-500 font-mono px-2 py-0.5 border border-slate-800 rounded bg-slate-900">v1.2.0</span>
          </h1>
        </div>
        <div className="text-xs text-slate-400 font-mono">Estación Médica Local con Persistencia SQL</div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        
        {/* Fila Superior: Operaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Columna Izquierda: Formulario */}
          <section className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <span>📋</span> Registro de Screening Cardíaco
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Cédula de Ciudadanía</label>
                <input 
                  type="text" 
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="Ej. 1140000000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Nombre Completo del Paciente</label>
                <input 
                  type="text" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Edad</label>
                <input 
                  type="number" 
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                  placeholder="Ej. 45"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Fonocardiograma Acústico (.wav)</label>
                <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-4 transition-colors bg-slate-900/50 text-center relative">
                  <input 
                    type="file" 
                    accept=".wav"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="text-2xl block mb-1">🫀</span>
                  <p className="text-xs text-slate-300 font-medium truncate max-w-[250px] mx-auto">
                    {file ? file.name : "Arrastra o selecciona el archivo acústico"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Formato de audio digital PCM .WAV</p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-400">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium text-sm shadow-lg transition-all duration-200 cursor-pointer ${
                  loading 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 active:scale-[0.99]'
                }`}
              >
                {loading ? 'Analizando Huella Acústica...' : 'Iniciar Diagnóstico Asistido'}
              </button>
            </form>
          </section>

          {/* Columna Derecha: Resultado Actual */}
          <section className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm min-h-[390px] flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-teal-400 mb-4 flex items-center gap-2">
                <span>📊</span> Resultado Inmediato
              </h2>

              {!result && !loading && (
                <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500 border border-slate-800/60 border-dashed rounded-xl bg-slate-900/20">
                  <span className="text-3xl mb-2">🩺</span>
                  <p className="text-xs">Esperando procesamiento de señales biométricas...</p>
                </div>
              )}

              {loading && (
                <div className="h-48 flex flex-col items-center justify-center text-center">
                  <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs text-slate-400 font-mono">Inferencia algorítmica y persistencia en paralelo...</p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                      <span className="block text-[10px] font-mono text-slate-500 uppercase">Clasificación IA</span>
                      <span className={`text-base font-bold ${result.diagnosis.startsWith('Normal') ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {result.diagnosis}
                      </span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                      <span className="block text-[10px] font-mono text-slate-500 uppercase">Certeza</span>
                      <span className="text-base font-bold text-teal-400">{(result.probability * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1.5">
                    <span className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Registro Médico Confirmado</span>
                    <div className="text-xs grid grid-cols-1 gap-y-1 text-slate-300 font-mono">
                      <div><span className="text-slate-500">ID Caso:</span> #{result.id}</div>
                      <div><span className="text-slate-500">Paciente:</span> {result.nombre_paciente} ({result.cedula_paciente})</div>
                      <div><span className="text-slate-500">Archivo:</span> <span className="text-slate-400 text-[11px]">{result.filename}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {result && result.s3_url && (
              <div className="pt-4 border-t border-slate-800/80">
                <a 
                  href={result.s3_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs bg-slate-900 border border-slate-700 hover:border-teal-500/40 text-slate-200 px-4 py-2 rounded-lg transition-colors w-full justify-center"
                >
                  🌐 Abrir Telemetría de Audio en AWS S3 →
                </a>
              </div>
            )}
          </section>
        </div>

        {/* Fila Inferior: Historial Clínico desde PostgreSQL */}
        <section className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <span>🗄️</span> Historial Clínico Local (Persistido en PostgreSQL)
          </h2>

          {history.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-4 text-center">No hay registros previos guardados en la base de datos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Cédula</th>
                    <th className="p-3">Paciente</th>
                    <th className="p-3">Diagnóstico</th>
                    <th className="p-3">Certeza</th>
                    <th className="p-3">Fecha de Registro</th>
                    <th className="p-3 text-center">Auditoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 text-slate-500">#{record.id}</td>
                      <td className="p-3 font-medium text-slate-200">{record.cedula_paciente}</td>
                      <td className="p-3 text-slate-300">{record.nombre_paciente}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          record.diagnosis.startsWith('Normal') 
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50' 
                            : 'bg-rose-950/40 text-rose-400 border border-rose-900/50'
                        }`}>
                          {record.diagnosis}
                        </span>
                      </td>
                      <td className="p-3 text-teal-400 font-bold">{(record.probability * 100).toFixed(0)}%</td>
                      <td className="p-3 text-slate-400">{new Date(record.created_at).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <a 
                          href={record.s3_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-teal-400 hover:underline hover:text-teal-300"
                        >
                          Reproducir 🎧
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}