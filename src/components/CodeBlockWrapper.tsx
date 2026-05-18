'use client';

import { useEffect } from 'react';

export default function CodeBlockWrapper({ htmlContent }: { htmlContent: string }) {
  useEffect(() => {
    const codeBlocks = document.querySelectorAll('pre');
    
    codeBlocks.forEach((block) => {
      if (block.querySelector('.code-header')) return;
      
      const codeElement = block.querySelector('code');
      if (!codeElement) return;
      
      const className = codeElement.className;
      const match = className.match(/language-(\w+)/);
      const language = match ? match[1] : 'text';
      
      // 获取代码内容并清理可能存在的反引号
      let codeContent = codeElement.innerHTML;
      
      // 移除代码内容前后可能存在的反引号
      codeContent = codeContent.replace(/^`+/, '').replace(/`+$/, '');
      codeContent = codeContent.replace(/^\s*`/, '').replace(/`\s*$/, '');
      
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper rounded-lg overflow-hidden border border-gray-200 bg-gray-50';
      
      const header = document.createElement('div');
      header.className = 'code-header flex items-center justify-between px-3 py-2 bg-gray-100 border-b border-gray-200';
      
      const langLabel = document.createElement('span');
      langLabel.className = 'text-xs text-gray-500 font-medium';
      langLabel.textContent = language;
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors';
      copyBtn.textContent = '复制';
      
      copyBtn.addEventListener('click', async () => {
        await navigator.clipboard.writeText(codeElement.textContent || '');
        copyBtn.textContent = '✓ 已复制';
        copyBtn.className = 'copy-btn px-2 py-1 text-xs text-white bg-green-500 rounded transition-colors';
        setTimeout(() => {
          copyBtn.textContent = '复制';
          copyBtn.className = 'copy-btn px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors';
        }, 2000);
      });
      
      const codeContainer = document.createElement('div');
      codeContainer.className = 'code-content overflow-auto max-h-96';
      
      const newCode = document.createElement('code');
      newCode.className = codeElement.className;
      newCode.innerHTML = codeContent;
      
      header.appendChild(langLabel);
      header.appendChild(copyBtn);
      codeContainer.appendChild(newCode);
      wrapper.appendChild(header);
      wrapper.appendChild(codeContainer);
      
      block.parentNode?.replaceChild(wrapper, block);
    });
  }, [htmlContent]);

  return (
    <div
      className="prose prose-lg max-w-none text-gray-700"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
