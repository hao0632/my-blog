'use client';

import { useState } from 'react';
import { Heading } from '@/lib/posts';

interface TocItemProps {
  heading: Heading;
  allHeadings: Heading[];
  depth: number;
}

function TocItem({ heading, allHeadings, depth }: TocItemProps) {
  const [isExpanded, setIsExpanded] = useState(depth <= 1);
  const childLevel = heading.level + 1;
  const currentIndex = allHeadings.findIndex((h) => h.id === heading.id);
  
  const children: Heading[] = [];
  for (let i = currentIndex + 1; i < allHeadings.length; i++) {
    const h = allHeadings[i];
    if (h.level === childLevel) {
      children.push(h);
    } else if (h.level <= heading.level) {
      break;
    }
  }
  
  const hasChildren = children.length > 0;
  const isCollapsible = hasChildren;

  return (
    <li key={heading.id}>
      <div className="flex items-center">
        {isCollapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={isExpanded ? '折叠' : '展开'}
          >
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {!isCollapsible && <span className="w-5" />}
        <a
          href={`#${heading.id}`}
          className={`flex-1 block py-1.5 px-2 rounded text-sm transition-colors hover:bg-gray-100 ${
            heading.level === 2
              ? 'text-gray-800 font-medium'
              : heading.level === 3
              ? 'text-gray-700 pl-2'
              : heading.level === 4
              ? 'text-gray-600 pl-4'
              : 'text-gray-500 pl-6'
          }`}
        >
          {heading.text}
        </a>
      </div>
      {isCollapsible && (
        <ul className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          {children.map((child) => (
            <TocItem key={child.id} heading={child} allHeadings={allHeadings} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) return null;

  const level2Headings = headings.filter((h) => h.level === 2);

  return (
    <div className="sticky top-8 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
        目录
      </h3>
      <nav className="toc-nav">
        <ul className="space-y-1">
          {level2Headings.map((heading) => (
            <TocItem key={heading.id} heading={heading} allHeadings={headings} depth={0} />
          ))}
        </ul>
      </nav>
    </div>
  );
}