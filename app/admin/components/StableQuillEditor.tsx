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

        // === FIX PICKER DROPDOWNS ===
        // Completely take over picker click handling to avoid Quill's
        // internal event system that causes the blink.
        const toolbar = containerRef.current?.querySelector('.ql-toolbar');
        if (toolbar) {
          const allPickers = toolbar.querySelectorAll('.ql-picker');

          // For each picker, replace the label's mousedown with our own click handler
          allPickers.forEach((picker: Element) => {
            const label = picker.querySelector('.ql-picker-label');
            if (!label) return;

            // Clone the label to remove ALL existing event listeners
            const newLabel = label.cloneNode(true) as HTMLElement;
            label.parentNode?.replaceChild(newLabel, label);

            // Add our own click handler (not mousedown!)
            newLabel.addEventListener('click', (e) => {
              e.stopPropagation();
              e.preventDefault();

              const isExpanded = picker.classList.contains('ql-expanded');

              // Close all other pickers
              allPickers.forEach((p: Element) => {
                if (p !== picker) {
                  p.classList.remove('ql-expanded');
                  p.querySelector('.ql-picker-label')?.setAttribute('aria-expanded', 'false');
                  p.querySelector('.ql-picker-options')?.setAttribute('aria-hidden', 'true');
                }
              });

              // Toggle this picker
              if (isExpanded) {
                picker.classList.remove('ql-expanded');
                newLabel.setAttribute('aria-expanded', 'false');
                picker.querySelector('.ql-picker-options')?.setAttribute('aria-hidden', 'true');
              } else {
                picker.classList.add('ql-expanded');
                newLabel.setAttribute('aria-expanded', 'true');
                picker.querySelector('.ql-picker-options')?.setAttribute('aria-hidden', 'false');
              }
            });

            // Also handle keyboard for accessibility
            newLabel.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                newLabel.click();
              } else if (e.key === 'Escape') {
                picker.classList.remove('ql-expanded');
                newLabel.setAttribute('aria-expanded', 'false');
                picker.querySelector('.ql-picker-options')?.setAttribute('aria-hidden', 'true');
                newLabel.focus();
              }
            });
          });

          // Close pickers on click outside the toolbar
          outsideClickHandler = (e: MouseEvent) => {
            if (!toolbar.contains(e.target as Node)) {
              allPickers.forEach((p: Element) => {
                p.classList.remove('ql-expanded');
                p.querySelector('.ql-picker-label')?.setAttribute('aria-expanded', 'false');
                p.querySelector('.ql-picker-options')?.setAttribute('aria-hidden', 'true');
              });
            }
          };
          // Use setTimeout to avoid catching the current click
          setTimeout(() => {
            if (mounted) {
              document.addEventListener('click', outsideClickHandler!, true);
            }
          }, 100);

          // Handle picker item clicks (selecting an option)
          allPickers.forEach((picker: Element) => {
            const items = picker.querySelectorAll('.ql-picker-item');
            items.forEach((item: Element) => {
              // Clone to remove existing listeners
              const newItem = item.cloneNode(true) as HTMLElement;
              item.parentNode?.replaceChild(newItem, item);

              newItem.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Get the value
                const dataValue = newItem.getAttribute('data-value');
                
                // Update the underlying select element
                const select = picker.querySelector('select');
                if (select) {
                  if (dataValue) {
                    select.value = dataValue;
                  } else {
                    // Empty value = default option (first one or the one without value)
                    const defaultOption = select.querySelector('option[selected]') || select.querySelector('option');
                    if (defaultOption) {
                      select.value = (defaultOption as HTMLOptionElement).value;
                    }
                  }
                  select.dispatchEvent(new Event('change'));
                }

                // Update visual selection
                picker.querySelectorAll('.ql-picker-item').forEach((i: Element) => {
                  i.classList.remove('ql-selected');
                });
                newItem.classList.add('ql-selected');

                // Update label
                const label = picker.querySelector('.ql-picker-label');
                if (label) {
                  if (dataValue) {
                    label.setAttribute('data-value', dataValue);
                  } else {
                    label.removeAttribute('data-value');
                  }
                  const dataLabel = newItem.getAttribute('data-label');
                  if (dataLabel) {
                    label.setAttribute('data-label', dataLabel);
                  } else {
                    label.removeAttribute('data-label');
                  }
                }

                // Close the picker
                picker.classList.remove('ql-expanded');
                (picker.querySelector('.ql-picker-label') as HTMLElement)?.setAttribute('aria-expanded', 'false');
                picker.querySelector('.ql-picker-options')?.setAttribute('aria-hidden', 'true');
              });
            });
          });
        }

        // Also neutralize the base theme's click handler for pickers
        // by removing pickers from the theme's array
        const theme = (quill as any).theme;
        if (theme && theme.pickers) {
          // Replace each picker's close method with a no-op
          // so the base theme's click handler can't close them
          theme.pickers.forEach((picker: any) => {
            picker.close = () => {}; // no-op
            picker.togglePicker = () => {}; // no-op (we handle toggling)
          });
        }
      };

      initQuill();

      return () => {
        mounted = false;
        if (outsideClickHandler) {
          document.removeEventListener('click', outsideClickHandler, true);
        }
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
