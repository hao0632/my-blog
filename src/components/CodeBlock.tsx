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
    <div className="relative rounded-lg overflow-hidden border border-slate-700 w-full">
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
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <pre ref={codeRef} className="bg-slate-800 p-4 min-w-max">
          <code className={`language-${language} text-sm`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
