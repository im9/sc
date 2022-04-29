import React, { useState, useRef, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

const defaultValue = [
  "function x() {",
  '\tconsole.log("Hello world!");',
  "}",
].join("\n");

function App() {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const [execValue, setExecValue] = useState<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    editor.onKeyDown(async function (event: any) {
      const { keyCode, ctrlKey, metaKey } = event;
      // cmd + Enter
      if (metaKey === true && keyCode === 3) {
        const r = editorRef.current?.getSelection();
        const v = editorRef.current?.getModel().getValueInRange(r);
        setExecValue(v);
        event.stopPropagation();
        return;
      }
    });
  };

  useEffect(() => {
    const selection = editorRef.current?.getSelection();
    if (monaco && execValue && selection) {
      const { startLineNumber, startColumn, endLineNumber, endColumn } =
        selection;
      const r = new monaco.Range(
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn
      );
      editorRef.current.deltaDecorations(
        [],
        [
          {
            range: r,
            options: {
              inlineClassName: "inlineDecoration",
            },
          },
        ]
      );
    }
  }, [monaco, execValue]);

  return (
    <Editor
      height="90vh"
      width="90vw"
      defaultValue={defaultValue}
      defaultLanguage="javascript"
      theme="vs-dark"
      onMount={handleEditorDidMount}
    />
  );
}

export default App;
