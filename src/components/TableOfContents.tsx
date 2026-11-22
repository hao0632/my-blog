'use client';

import { useMemo, useState } from 'react';
import { Heading } from '@/lib/posts';

interface TocNode extends Heading {
  children: TocNode[];
}

interface TocItemProps {
  node: TocNode;
  depth: number;
}

const DEPTH_CLASS = [
  'text-fg font-medium',
  'text-fg/80 pl-2',
  'text-muted pl-4',
  'text-subtle pl-6',
];

function TocItem({ node, depth }: TocItemProps) {
  const [isExpanded, setIsExpanded] = useState(depth <= 1);
  const hasChildren = node.children.length > 0;
  const depthClass = DEPTH_CLASS[Math.min(depth, DEPTH_CLASS.length - 1)];

  return (
    <li>
      <div className="flex items-center">
        {hasChildren ? (
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
        ) : (
          <span className="w-5" />
        )}
        <a
          href={`#${node.id}`}
          title={node.text}
          className={`flex-1 min-w-0 truncate block py-1.5 px-2 rounded text-sm transition-colors hover:bg-raised ${depthClass}`}
        >
          {node.text}
        </a>
      </div>
      {hasChildren && (
        <div
          className={`grid transition-all duration-200 ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
          <div className="overflow-hidden min-h-0">
            <ul>
              {node.children.map((child) => (
                <TocItem key={child.id} node={child} depth={depth + 1} />
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

/**
 * 按标题层级构建目录树。允许跳级（如 h2 下面直接是 h4），
 * 跳级的标题会挂到最近的、层级更浅的祖先上。
 */
function buildTree(headings: Heading[]): TocNode[] {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];

  for (const heading of headings) {
    const node: TocNode = { ...heading, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }

    stack.push(node);
  }

  return roots;
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const tree = useMemo(() => buildTree(headings), [headings]);

  if (tree.length === 0) return null;

  return (
    <div className="sticky top-8 bg-surface rounded-lg border border-line p-4 shadow-sm">
      <h3 className="font-semibold text-fg mb-3 pb-2 border-b border-line">
        目录
      </h3>
      <nav className="toc-nav max-h-[calc(100vh-12rem)] overflow-y-scroll overflow-x-hidden pr-1">
        <ul className="space-y-1">
          {tree.map((node) => (
            <TocItem key={node.id} node={node} depth={0} />
          ))}
        </ul>
      </nav>
    </div>
  );
}
