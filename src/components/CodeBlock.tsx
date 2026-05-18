import { useEffect, useRef } from 'react';

export default function CodeBlock({ code, language }: { code: string; language: string }) {
  const codeRef = useRef<HTMLPreElement>(null);
  const copiedRef = useRef(false);

  const handleCopy = async () => {
    if (codeRef.current) {
      await navigator.clipboard.writeText(code);
      copiedRef.current = true;
      setTimeout(() => {
        copiedRef.current = false;
      }, 2000);
    }
  };

  return (
    <pre ref={codeRef} className="relative bg-slate-800 rounded-lg overflow-hidden border border-slate-700 max-h-[400px] overflow-y-auto">
      <button
        onClick={handleCopy}
        className={`absolute top-2 right-2 px-2 py-1 text-xs rounded transition-all z-10 ${
          copiedRef.current
            ? 'bg-emerald-500 text-white'
            : 'bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white'
        }`}
      >
        {copiedRef.current ? '✓ 已复制' : '复制'}
      </button>
      <code className={`language-${language}`}>
        {code}
      </code>
    </pre>
  );
}
