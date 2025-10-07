// 📝 components/RichTextEditor/RichTextEditor.jsx - Editor de texto enriquecido tipo Wikipedia
import React, { useState, useRef, useEffect } from 'react';
import './RichTextEditor.css';

const RichTextEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'Escriba su contenido aquí...',
  height = '400px' 
}) => {
  const editorRef = useRef(null);
  const [isToolbarSticky, setIsToolbarSticky] = useState(false);
  const [activeFormats, setActiveFormats] = useState(new Set());
  const [stats, setStats] = useState({ characters: 0, words: 0 });

  useEffect(() => {
    // Configurar el editor como contentEditable
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
      
      // Forzar color del texto al inicializar
      editorRef.current.style.color = '#1a1a1a';
      
      // Aplicar color a todos los elementos existentes
      const allElements = editorRef.current.querySelectorAll('*');
      allElements.forEach(el => {
        el.style.color = '#1a1a1a';
      });
      
      // Calcular estadísticas iniciales
      const textContent = editorRef.current.textContent || '';
      const words = textContent.split(/\s+/).filter(w => w.length > 0);
      setStats({
        characters: textContent.length,
        words: words.length,
        lines: textContent.split('\n').length
      });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (editorRef.current) {
        const rect = editorRef.current.getBoundingClientRect();
        setIsToolbarSticky(rect.top < 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ejecutar comandos de formato
  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateActiveFormats();
    handleContentChange();
  };

  // Actualizar el estado de los formatos activos
  const updateActiveFormats = () => {
    const formats = new Set();
    
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('strikeThrough')) formats.add('strikethrough');
    if (document.queryCommandState('insertOrderedList')) formats.add('ol');
    if (document.queryCommandState('insertUnorderedList')) formats.add('ul');
    
    setActiveFormats(formats);
  };

  // Manejar cambios en el contenido
  const handleContentChange = () => {
    if (editorRef.current && onChange) {
      // Forzar color del texto
      editorRef.current.style.color = '#1a1a1a';
      
      // Aplicar color a todos los elementos hijos
      const allElements = editorRef.current.querySelectorAll('*');
      allElements.forEach(el => {
        if (!el.style.color || el.style.color === 'white' || el.style.color === '#ffffff') {
          el.style.color = '#1a1a1a';
        }
      });
      
      // Obtener contenido y estadísticas
      const content = editorRef.current.innerHTML;
      const textContent = editorRef.current.textContent || '';
      const words = textContent.split(/\s+/).filter(w => w.length > 0);
      
      const newStats = {
        characters: textContent.length,
        words: words.length,
        lines: textContent.split('\n').length
      };
      
      setStats(newStats);
      
      console.log('📝 RichTextEditor enviando:', { content, stats: newStats });
      
      // Enviar contenido y estadísticas al componente padre
      onChange(content, newStats);
    }
  };

  // Insertar título
  const insertHeading = (level) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString() || `Título ${level}`;
      
      executeCommand('formatBlock', `h${level}`);
      if (selectedText === `Título ${level}`) {
        range.deleteContents();
        range.insertNode(document.createTextNode(selectedText));
      }
    }
  };

  // Insertar enlace
  const insertLink = () => {
    const url = prompt('Ingrese la URL del enlace:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  // Insertar imagen
  const insertImage = () => {
    const url = prompt('Ingrese la URL de la imagen:');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  // Insertar tabla
  const insertTable = () => {
    const rows = prompt('Número de filas:') || '3';
    const cols = prompt('Número de columnas:') || '3';
    
    let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;"><tbody>';
    for (let i = 0; i < parseInt(rows); i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < parseInt(cols); j++) {
        tableHTML += i === 0 ? '<th style="padding: 8px; background: #f5f5f5;">Encabezado</th>' : '<td style="padding: 8px;">Celda</td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table>';
    
    executeCommand('insertHTML', tableHTML);
  };

  // Cambiar color de texto
  const changeTextColor = (color) => {
    executeCommand('foreColor', color);
  };

  // Cambiar color de fondo
  const changeBackgroundColor = (color) => {
    executeCommand('hiliteColor', color);
  };

  // Limpiar formato
  const clearFormat = () => {
    executeCommand('removeFormat');
  };

  // Toolbar buttons configuration
  const toolbarButtons = [
    {
      group: 'headings',
      title: 'Títulos',
      buttons: [
        { icon: 'H1', command: () => insertHeading(1), title: 'Título Principal' },
        { icon: 'H2', command: () => insertHeading(2), title: 'Subtítulo' },
        { icon: 'H3', command: () => insertHeading(3), title: 'Título Menor' },
        { icon: 'H4', command: () => insertHeading(4), title: 'Título Pequeño' }
      ]
    },
    {
      group: 'text-format',
      title: 'Formato de Texto',
      buttons: [
        { icon: '𝐁', command: () => executeCommand('bold'), active: 'bold', title: 'Negrita' },
        { icon: '𝐼', command: () => executeCommand('italic'), active: 'italic', title: 'Cursiva' },
        { icon: '𝐔', command: () => executeCommand('underline'), active: 'underline', title: 'Subrayado' },
        { icon: '𝐒', command: () => executeCommand('strikeThrough'), active: 'strikethrough', title: 'Tachado' }
      ]
    },
    {
      group: 'alignment',
      title: 'Alineación',
      buttons: [
        { icon: '⬅️', command: () => executeCommand('justifyLeft'), title: 'Alinear Izquierda' },
        { icon: '↔️', command: () => executeCommand('justifyCenter'), title: 'Centrar' },
        { icon: '➡️', command: () => executeCommand('justifyRight'), title: 'Alinear Derecha' },
        { icon: '↕️', command: () => executeCommand('justifyFull'), title: 'Justificar' }
      ]
    },
    {
      group: 'lists',
      title: 'Listas',
      buttons: [
        { icon: '1.', command: () => executeCommand('insertOrderedList'), active: 'ol', title: 'Lista Numerada' },
        { icon: '•', command: () => executeCommand('insertUnorderedList'), active: 'ul', title: 'Lista con Viñetas' },
        { icon: '⬅️', command: () => executeCommand('outdent'), title: 'Reducir Sangría' },
        { icon: '➡️', command: () => executeCommand('indent'), title: 'Aumentar Sangría' }
      ]
    },
    {
      group: 'insert',
      title: 'Insertar',
      buttons: [
        { icon: '🔗', command: insertLink, title: 'Insertar Enlace' },
        { icon: '🖼️', command: insertImage, title: 'Insertar Imagen' },
        { icon: '📊', command: insertTable, title: 'Insertar Tabla' },
        { icon: '➖', command: () => executeCommand('insertHTML', '<hr>'), title: 'Línea Horizontal' }
      ]
    },
    {
      group: 'colors',
      title: 'Colores',
      buttons: [
        { icon: '🎨', command: () => changeTextColor('#ff0000'), title: 'Color de Texto', type: 'color-picker' },
        { icon: '🎨', command: () => changeBackgroundColor('#ffff00'), title: 'Color de Fondo', type: 'bg-color-picker' }
      ]
    },
    {
      group: 'actions',
      title: 'Acciones',
      buttons: [
        { icon: '↶', command: () => executeCommand('undo'), title: 'Deshacer' },
        { icon: '↷', command: () => executeCommand('redo'), title: 'Rehacer' },
        { icon: '🧹', command: clearFormat, title: 'Limpiar Formato' }
      ]
    }
  ];

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className={`editor-toolbar ${isToolbarSticky ? 'sticky' : ''}`}>
        {toolbarButtons.map((group, groupIndex) => (
          <div key={groupIndex} className="toolbar-group">
            <div className="group-label">{group.title}</div>
            <div className="group-buttons">
              {group.buttons.map((button, buttonIndex) => (
                <button
                  key={buttonIndex}
                  className={`toolbar-btn ${activeFormats.has(button.active) ? 'active' : ''}`}
                  onClick={button.command}
                  title={button.title}
                  type="button"
                >
                  {button.icon}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Color Pickers */}
      <div className="color-pickers">
        <div className="color-group">
          <label>Color de Texto:</label>
          <input
            type="color"
            onChange={(e) => changeTextColor(e.target.value)}
            title="Cambiar color de texto"
          />
        </div>
        <div className="color-group">
          <label>Color de Fondo:</label>
          <input
            type="color"
            onChange={(e) => changeBackgroundColor(e.target.value)}
            title="Cambiar color de fondo"
          />
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        style={{ 
          minHeight: height,
          color: '#1a1a1a',
          fontSize: '16px',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
        onInput={handleContentChange}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Character Count */}
      <div className="editor-status">
        <span>Caracteres: {stats.characters}</span>
        <span>Palabras: {stats.words}</span>
      </div>
    </div>
  );
};

export default RichTextEditor;