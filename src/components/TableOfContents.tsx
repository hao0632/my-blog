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
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-subtle hover:text-fg transition-colors"
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
          className={`flex-1 block py-1.5 px-2 rounded text-sm transition-colors hover:bg-raised ${
            heading.level === 2
              ? 'text-fg font-medium'
              : heading.level === 3
              ? 'text-fg/80 pl-2'
              : heading.level === 4
              ? 'text-muted pl-4'
              : 'text-subtle pl-6'
          }`}
        >
          {heading.text}
        </a>
      </div>
      {isCollapsible && (
        <div
          className={`grid transition-all duration-200 ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
          <div className="overflow-hidden min-h-0">
            <ul>
              {children.map((child) => (
                <TocItem key={child.id} heading={child} allHeadings={allHeadings} depth={depth + 1} />
              ))}
            </ul>
          </div>
        </div>
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
    <div className="sticky top-8 bg-surface rounded-lg border border-line p-4 shadow-sm">
      <h3 className="font-semibold text-fg mb-3 pb-2 border-b border-line">
        目录
      </h3>
      <nav className="toc-nav max-h-[calc(100vh-12rem)] overflow-y-scroll overflow-x-hidden pr-1">
        <ul className="space-y-1">
          {level2Headings.map((heading) => (
            <TocItem key={heading.id} heading={heading} allHeadings={headings} depth={0} />
          ))}
        </ul>
      </nav>
    </div>
  );
}
