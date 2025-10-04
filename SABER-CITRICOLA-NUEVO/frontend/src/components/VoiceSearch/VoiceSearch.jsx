// 🎤 VoiceSearch.jsx - Componente de búsqueda por voz
import React, { useState, useEffect, useRef } from 'react';
import './VoiceSearch.css';

const VoiceSearch = ({ onVoiceResult, onSearchSubmit, placeholder = "¿Qué necesitas aprender hoy?" }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [error, setError] = useState('');
    const recognitionRef = useRef(null);
    const timeoutRef = useRef(null);

    // Comandos de voz específicos para citricultura
    const citrusCommands = {
        'control de plagas': 'control de plagas',
        'plagas': 'control de plagas',
        'insectos': 'control de plagas',
        'poda': 'técnicas de poda',
        'podar': 'técnicas de poda',
        'fertilizar': 'fertilización',
        'fertilizacion': 'fertilización',
        'abono': 'fertilización',
        'riego': 'sistemas de riego',
        'regar': 'sistemas de riego',
        'agua': 'sistemas de riego',
        'injerto': 'técnicas de injerto',
        'injertar': 'técnicas de injerto',
        'enfermedad': 'enfermedades citricolas',
        'enfermedades': 'enfermedades citricolas',
        'hongo': 'enfermedades citricolas',
        'hongos': 'enfermedades citricolas'
    };

    // Normalizar comando de voz
    const normalizeCommand = (text) => {
        const normalized = text.toLowerCase().trim();
        
        // Buscar comandos específicos
        for (const [key, value] of Object.entries(citrusCommands)) {
            if (normalized.includes(key)) {
                return value;
            }
        }
        
        return normalized;
    };

    // Verificar soporte del navegador
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            setIsSupported(true);
            recognitionRef.current = new SpeechRecognition();
            
            // Configuración del reconocimiento de voz
            const recognition = recognitionRef.current;
            recognition.continuous = false; // Una sola frase
            recognition.interimResults = true; // Resultados parciales
            recognition.lang = 'es-ES'; // Español
            recognition.maxAlternatives = 3; // Más alternativas para mejor precisión

            // Cuando se obtiene un resultado
            recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript;
                        setConfidence(result[0].confidence);
                    } else {
                        interimTranscript += result[0].transcript;
                    }
                }

                const fullTranscript = finalTranscript || interimTranscript;
                setTranscript(fullTranscript);
                
                if (onVoiceResult) {
                    onVoiceResult(fullTranscript, !!finalTranscript);
                }

                // Si es resultado final, normalizar y buscar
                if (finalTranscript && onSearchSubmit) {
                    const normalizedCommand = normalizeCommand(finalTranscript);
                    console.log('🎤 Comando original:', finalTranscript);
                    console.log('🎯 Comando normalizado:', normalizedCommand);
                    
                    setTimeout(() => {
                        onSearchSubmit(normalizedCommand);
                        stopListening();
                    }, 500);
                }
            };

            // Cuando comienza a escuchar
            recognition.onstart = () => {
                setIsListening(true);
                setError('');
                setTranscript('');
                console.log('🎤 Iniciando reconocimiento de voz...');
            };

            // Cuando termina de escuchar
            recognition.onend = () => {
                setIsListening(false);
                console.log('🎤 Reconocimiento de voz terminado');
            };

            // Manejo de errores
            recognition.onerror = (event) => {
                console.error('❌ Error en reconocimiento de voz:', event.error);
                setIsListening(false);
                
                switch (event.error) {
                    case 'no-speech':
                        setError('No se detectó habla. Intenta de nuevo.');
                        break;
                    case 'audio-capture':
                        setError('No se puede acceder al micrófono.');
                        break;
                    case 'not-allowed':
                        setError('Permisos de micrófono denegados.');
                        break;
                    case 'network':
                        setError('Error de conexión. Verifica tu internet.');
                        break;
                    case 'service-not-allowed':
                        setError('Servicio de reconocimiento no disponible.');
                        break;
                    default:
                        setError('Error de reconocimiento de voz.');
                }
            };

            // Auto-parar después de silencio
            recognition.onspeechend = () => {
                console.log('🔇 Habla terminada');
                timeoutRef.current = setTimeout(() => {
                    if (isListening) {
                        stopListening();
                    }
                }, 1000);
            };

        } else {
            setIsSupported(false);
            console.warn('⚠️ Web Speech API no soportada en este navegador');
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Iniciar reconocimiento de voz
    const startListening = () => {
        if (!isSupported) {
            setError('Tu navegador no soporta reconocimiento de voz.');
            return;
        }

        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error('Error al iniciar reconocimiento:', error);
                setError('Error al iniciar el micrófono.');
            }
        }
    };

    // Detener reconocimiento de voz
    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    // Alternar estado de escucha
    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // Limpiar transcript cuando se detiene
    useEffect(() => {
        if (!isListening && transcript) {
            const timer = setTimeout(() => {
                setTranscript('');
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isListening, transcript]);

    return (
        <div className="voice-search-container">
            {/* Botón principal de micrófono */}
            <div className="voice-search-main">
                <button
                    className={`voice-button ${isListening ? 'listening' : ''} ${!isSupported ? 'disabled' : ''}`}
                    onClick={toggleListening}
                    disabled={!isSupported}
                    title={isSupported ? 
                        (isListening ? 'Click para detener grabación' : 'Click para buscar por voz') : 
                        'Reconocimiento de voz no disponible'
                    }
                >
                    {isListening ? (
                        <div className="microphone-active">
                            <span className="mic-icon">🎤</span>
                            <div className="voice-waves">
                                <div className="wave wave1"></div>
                                <div className="wave wave2"></div>
                                <div className="wave wave3"></div>
                            </div>
                        </div>
                    ) : (
                        <span className="mic-icon">{isSupported ? '🎤' : '🚫'}</span>
                    )}
                </button>

                {/* Indicador de estado */}
                <div className="voice-status">
                    {isListening && (
                        <div className="listening-indicator">
                            <span className="status-text">Escuchando...</span>
                            <div className="pulse-dot"></div>
                        </div>
                    )}
                    
                    {transcript && (
                        <div className="transcript-preview">
                            <span className="transcript-text">"{transcript}"</span>
                            {confidence > 0 && (
                                <span className="confidence-score">
                                    {Math.round(confidence * 100)}% seguro
                                </span>
                            )}
                        </div>
                    )}
                    
                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            <span className="error-text">{error}</span>
                        </div>
                    )}
                    
                    {!isSupported && (
                        <div className="not-supported-message">
                            <span className="warning-icon">🔇</span>
                            <span className="warning-text">
                                Búsqueda por voz no disponible en este navegador
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Instrucciones */}
            {isSupported && !isListening && !transcript && !error && (
                <div className="voice-instructions">
                    <p className="instruction-text">
                        💡 <strong>Tip:</strong> Haz click en el micrófono y di algo como:
                    </p>
                    <div className="example-commands">
                        <span className="command-example">"Control de plagas"</span>
                        <span className="command-example">"Técnicas de poda"</span>
                        <span className="command-example">"Fertilización orgánica"</span>
                        <span className="command-example">"Sistemas de riego"</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceSearch;