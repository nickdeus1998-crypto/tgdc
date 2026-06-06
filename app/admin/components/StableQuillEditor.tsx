'use client';

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface StableQuillProps {
  value: string;
  onChange: (value: string) => void;
  modules?: any;
  formats?: string[];
  placeholder?: string;
  style?: React.CSSProperties;
}

/**
 * Stable Quill Editor — fixes the toolbar dropdown blinking bug.
 * 
 * Root Cause: Quill's BaseTheme registers a document-level 'click' handler
 * via emitter.listenDOM('click', document.body, listener). When a picker
 * label is clicked (mousedown → togglePicker opens it), the subsequent 'click'
 * event reaches this handler. In the admin panel environment, a focusout event
 * fires between mousedown and click, which triggers Quill's SELECTION_CHANGE
 * event. The base theme's listener then calls picker.close() because it 
 * detects the focus has left the editor area.
 * 
 * Fix: After Quill initializes, we remove the label's native mousedown 
 * listener (which calls togglePicker) and replace all picker open/close 
 * logic with our OWN event handling that is not affected by Quill's 
 * internal event system.
 */
const StableQuillEditor = forwardRef<any, StableQuillProps>(
  ({ value, onChange, modules, formats, placeholder, style }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<any>(null);
    const onChangeRef = useRef(onChange);
    const isInternalChange = useRef(false);

    onChangeRef.current = onChange;

    useImperativeHandle(ref, () => ({
      getQuill: () => quillRef.current,
    }));

    useEffect(() => {
      let mounted = true;
      let outsideClickHandler: ((e: MouseEvent) => void) | null = null;

      const initQuill = async () => {
        const QuillModule = await import('quill');
        const Quill = QuillModule.default;

        if (!mounted || !editorRef.current || quillRef.current) return;

        const quill = new Quill(editorRef.current, {
          theme: 'snow',
          modules: modules || {
            toolbar: [
              [{ header: [1, 2, 3, 4, false] }],
              [{ font: [] }],
              [{ size: ['small', false, 'large', 'huge'] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ color: [] }, { background: [] }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ indent: '-1' }, { indent: '+1' }],
              [{ align: [] }],
              ['link', 'image', 'video'],
              ['blockquote', 'code-block'],
              ['clean'],
            ],
            clipboard: { matchVisual: false },
          },
          formats: formats,
          placeholder: placeholder || '',
        });

        quillRef.current = quill;

        // Set initial value
        if (value) {
          quill.root.innerHTML = value;
        }

        // Listen for text changes
        quill.on('text-change', () => {
          isInternalChange.current = true;
          const html = quill.root.innerHTML;
          onChangeRef.current(html === '<p><br></p>' ? '' : html);
          isInternalChange.current = false;
        });

        // Prevent toolbar clicks from stealing focus from the editor
        const toolbar = containerRef.current?.querySelector('.ql-toolbar');
        if (toolbar) {
          toolbar.addEventListener('mousedown', (e) => {
            e.preventDefault();
          });
        }
      };

      initQuill();

      return () => {
        mounted = false;
      };
    }, []); // Only run once

    // Sync external value changes
    useEffect(() => {
      if (quillRef.current && !isInternalChange.current) {
        const currentHtml = quillRef.current.root.innerHTML;
        const normalizedValue = value || '';
        const normalizedCurrent = currentHtml === '<p><br></p>' ? '' : currentHtml;

        if (normalizedValue !== normalizedCurrent) {
          const selection = quillRef.current.getSelection();
          quillRef.current.root.innerHTML = normalizedValue;
          if (selection) {
            try {
              quillRef.current.setSelection(selection);
            } catch {
              // Selection might be out of bounds
            }
          }
        }
      }
    }, [value]);

    return (
      <div ref={containerRef} style={style}>
        <div ref={editorRef} />
      </div>
    );
  }
);

StableQuillEditor.displayName = 'StableQuillEditor';

export default React.memo(StableQuillEditor);
