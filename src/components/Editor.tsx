import React, { useState, useRef, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import io from "socket.io-client";
import { keywords } from "../../synth/";

const socket = io();

const defaultValue = ["// example\nbubbles()"].join("\n");

function App() {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const [execValue, setExecValue] = useState<any>(null);

  const handleEditorDidMount = (editor: any) => {
    socket.on("logger", (log: string) => {
      console.log(log);
    });

    editorRef.current = editor;

    editor.onKeyDown(async function (event: any) {
      const { keyCode, ctrlKey, metaKey } = event;

      // cmd + Enter
      if (metaKey === true && keyCode === 3) {
        const r = editorRef.current?.getSelection();
        const v = editorRef.current?.getModel().getValueInRange(r);
        setExecValue(v);

        socket.emit("exec message", v);

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

  useEffect(() => {
    if (monaco) {
      monaco?.languages?.register({ id: "sclang" });
      monaco?.defineTheme?.register("sclang-theme", {
        base: "vs-dark",
        rules: [
          { token: "keyword", foreground: "#ff6600", fontStyle: "bold" },
          { token: "comment", foreground: "#999999" },
          { token: "string", foreground: "#009966" },
          { token: "variable", foreground: "#006699" },
        ],
      });
      monaco?.languages?.setMonarchTokensProvider("sclang", {
        keywords,
        tokenizer: {
          root: [
            [
              /@?[a-zA-Z][\w$]*/,
              {
                cases: {
                  "@keywords": "keyword",
                  "@default": "variables",
                },
              },
            ],
            [/".*?"/, "string"],
            [/[^\/*]+/, "comment"],
            [/\/\*/, "comment", "@push"], // nested comment
            ["\\*/", "comment", "@pop"],
            [/[\/*]/, "comment"],
          ],
        },
      });
      monaco?.languages?.registerCompletionItemProvider("sclang", {
        provideCompletionItems: (model: any, position: any) => {
          const suggestions = [
            ...keywords.map((k) => {
              return {
                label: k,
                kind: monaco?.languages?.CompletionItemKind?.keyword,
                insertText: k,
              };
            }),
          ];
          return { suggestions };
        },
      });
    }
  }, [monaco]);

  return (
    <Editor
      height="90vh"
      width="90vw"
      defaultValue={defaultValue}
      defaultLanguage="sclang"
      theme="sclang-theme"
      onMount={handleEditorDidMount}
    />
  );
}

export default App;
