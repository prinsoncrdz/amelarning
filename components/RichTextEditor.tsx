'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Link as LinkIcon,
  Eraser,
  Undo,
  Redo,
  Code2,
  FileText
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder = 'Write lesson content here...' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(value);

  // Sync incoming value to editable element on mount or when mode toggles
  useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, isSourceMode]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setSourceCode(html);
    }
  };

  const execCmd = (command: string, valueArg: string | undefined = undefined) => {
    document.execCommand(command, false, valueArg);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleAddLink = () => {
    const url = prompt('Enter website or resource URL:', 'https://');
    if (url) {
      execCmd('createLink', url);
    }
  };

  const toggleSourceMode = () => {
    if (isSourceMode) {
      // Switching from HTML Source back to Visual Word Canvas
      if (editorRef.current) {
        editorRef.current.innerHTML = sourceCode;
      }
      onChange(sourceCode);
      setIsSourceMode(false);
    } else {
      // Switching to Source Code view
      if (editorRef.current) {
        setSourceCode(editorRef.current.innerHTML);
      }
      setIsSourceMode(true);
    }
  };

  return (
    <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, overflow: 'hidden', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Word-Style Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          alignItems: 'center',
          padding: '8px 12px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          userSelect: 'none'
        }}
      >
        {/* Undo / Redo */}
        <button type="button" title="Undo" onClick={() => execCmd('undo')} style={btnStyle}>
          <Undo size={15} />
        </button>
        <button type="button" title="Redo" onClick={() => execCmd('redo')} style={btnStyle}>
          <Redo size={15} />
        </button>

        <div style={dividerStyle} />

        {/* Headings Dropdown */}
        <select
          onChange={e => {
            const val = e.target.value;
            if (val) execCmd('formatBlock', val);
          }}
          defaultValue=""
          style={{ height: 30, fontSize: 12, padding: '0 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
          disabled={isSourceMode}
        >
          <option value="">Paragraph</option>
          <option value="<h1>">Heading 1 (H1)</option>
          <option value="<h2>">Heading 2 (H2)</option>
          <option value="<h3>">Heading 3 (H3)</option>
          <option value="<blockquote>">Quote Block</option>
          <option value="<pre>">Code Block</option>
        </select>

        <div style={dividerStyle} />

        {/* Text Styles */}
        <button type="button" title="Bold" onClick={() => execCmd('bold')} style={btnStyle} disabled={isSourceMode}>
          <Bold size={15} />
        </button>
        <button type="button" title="Italic" onClick={() => execCmd('italic')} style={btnStyle} disabled={isSourceMode}>
          <Italic size={15} />
        </button>
        <button type="button" title="Underline" onClick={() => execCmd('underline')} style={btnStyle} disabled={isSourceMode}>
          <Underline size={15} />
        </button>
        <button type="button" title="Strikethrough" onClick={() => execCmd('strikeThrough')} style={btnStyle} disabled={isSourceMode}>
          <Strikethrough size={15} />
        </button>

        <div style={dividerStyle} />

        {/* Lists & Quote */}
        <button type="button" title="Bullet List" onClick={() => execCmd('insertUnorderedList')} style={btnStyle} disabled={isSourceMode}>
          <List size={15} />
        </button>
        <button type="button" title="Numbered List" onClick={() => execCmd('insertOrderedList')} style={btnStyle} disabled={isSourceMode}>
          <ListOrdered size={15} />
        </button>
        <button type="button" title="Blockquote" onClick={() => execCmd('formatBlock', '<blockquote>')} style={btnStyle} disabled={isSourceMode}>
          <Quote size={15} />
        </button>

        <div style={dividerStyle} />

        {/* Alignment */}
        <button type="button" title="Align Left" onClick={() => execCmd('justifyLeft')} style={btnStyle} disabled={isSourceMode}>
          <AlignLeft size={15} />
        </button>
        <button type="button" title="Align Center" onClick={() => execCmd('justifyCenter')} style={btnStyle} disabled={isSourceMode}>
          <AlignCenter size={15} />
        </button>
        <button type="button" title="Align Right" onClick={() => execCmd('justifyRight')} style={btnStyle} disabled={isSourceMode}>
          <AlignRight size={15} />
        </button>

        <div style={dividerStyle} />

        {/* Insert Link & Clear */}
        <button type="button" title="Insert Link" onClick={handleAddLink} style={btnStyle} disabled={isSourceMode}>
          <LinkIcon size={15} />
        </button>
        <button type="button" title="Clear Formatting" onClick={() => execCmd('removeFormat')} style={btnStyle} disabled={isSourceMode}>
          <Eraser size={15} />
        </button>

        <div style={{ flex: 1 }} />

        {/* Source HTML Code Mode Toggle */}
        <button
          type="button"
          onClick={toggleSourceMode}
          title={isSourceMode ? 'Switch to Word Canvas' : 'View HTML Code'}
          style={{
            ...btnStyle,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 600,
            background: isSourceMode ? '#4f46e5' : '#ffffff',
            color: isSourceMode ? '#ffffff' : '#475569',
            borderColor: isSourceMode ? '#4f46e5' : '#cbd5e1'
          }}
        >
          {isSourceMode ? (
            <>
              <FileText size={14} /> Visual Word View
            </>
          ) : (
            <>
              <Code2 size={14} /> Source HTML
            </>
          )}
        </button>
      </div>

      {/* Editor Body Area */}
      {isSourceMode ? (
        <textarea
          style={{
            width: '100%',
            minHeight: 220,
            padding: 16,
            border: 'none',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: 13,
            lineHeight: 1.5,
            outline: 'none',
            resize: 'vertical',
            background: '#0f172a',
            color: '#f8fafc'
          }}
          value={sourceCode}
          onChange={e => {
            setSourceCode(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="Type or paste HTML..."
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          style={{
            minHeight: 220,
            padding: '20px 24px',
            outline: 'none',
            fontSize: 14,
            lineHeight: 1.7,
            color: '#0f172a',
            background: '#ffffff'
          }}
        />
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  width: 30,
  height: 30,
  padding: 0,
  borderRadius: 4,
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#334155',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 18,
  background: '#cbd5e1',
  margin: '0 4px'
};
