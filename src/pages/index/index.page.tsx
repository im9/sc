import React from "react";

let MonacoEditor: any;
if (typeof window !== "undefined") {
  const { Editor } = await Promise.resolve(import("../../components/Editor"));

  MonacoEditor = Editor;
}

export { Page };

function Page() {
  if (!MonacoEditor) return <></>;

  return (
    <>
      <MonacoEditor />
    </>
  );
}
