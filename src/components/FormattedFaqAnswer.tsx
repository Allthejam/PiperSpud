'use client';

import React from 'react';

interface FormattedFaqAnswerProps {
  text: string;
  className?: string;
}

type Block = 
  | { type: 'paragraph'; lines: string[] }
  | { type: 'bullets'; items: string[] }
  | { type: 'numbered'; items: { num: string; text: string }[] };

/**
 * Parses markdown-style bold text (**bold**) into strong tags
 */
export function renderInlineText(text: string): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Parses raw text into paragraphs, bullet lists, and numbered lists
 */
export function parseFaqBlocks(rawText: string): Block[] {
  if (!rawText) return [];
  const lines = rawText.split(/\r?\n/);
  const blocks: Block[] = [];
  let currentParagraph: string[] = [];
  let currentBullets: string[] = [];
  let currentNumbered: { num: string; text: string }[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: 'paragraph', lines: [...currentParagraph] });
      currentParagraph = [];
    }
  };

  const flushBullets = () => {
    if (currentBullets.length > 0) {
      blocks.push({ type: 'bullets', items: [...currentBullets] });
      currentBullets = [];
    }
  };

  const flushNumbered = () => {
    if (currentNumbered.length > 0) {
      blocks.push({ type: 'numbered', items: [...currentNumbered] });
      currentNumbered = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      // Empty line signals a paragraph break
      flushParagraph();
      flushBullets();
      flushNumbered();
      continue;
    }

    // Check bullet indicators: "• ", "- ", "* ", "· ", "– "
    const bulletMatch = rawLine.match(/^\s*([•\-\*·–]|\u2022|\u25E6)\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      flushNumbered();
      currentBullets.push(bulletMatch[2]);
      continue;
    }

    // Check numbered indicators: "1. ", "2) "
    const numMatch = rawLine.match(/^\s*(\d+)[\.\)]\s+(.+)$/);
    if (numMatch) {
      flushParagraph();
      flushBullets();
      currentNumbered.push({ num: numMatch[1], text: numMatch[2] });
      continue;
    }

    // Regular paragraph line
    flushBullets();
    flushNumbered();
    currentParagraph.push(rawLine);
  }

  flushParagraph();
  flushBullets();
  flushNumbered();

  return blocks;
}

export const FormattedFaqAnswer: React.FC<FormattedFaqAnswerProps> = ({
  text,
  className = ''
}) => {
  if (!text) return null;
  const blocks = parseFaqBlocks(text);

  return (
    <div className={`space-y-3 leading-relaxed ${className}`}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'paragraph') {
          return (
            <p key={bIdx} className="whitespace-pre-line">
              {renderInlineText(block.lines.join('\n'))}
            </p>
          );
        }

        if (block.type === 'bullets') {
          return (
            <ul key={bIdx} className="space-y-2 my-2.5 pl-1">
              {block.items.map((item, iIdx) => (
                <li key={iIdx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-tartan-gold shrink-0 mt-2 shadow-[0_0_6px_rgba(212,175,55,0.6)]" />
                  <span className="flex-1">{renderInlineText(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'numbered') {
          return (
            <ol key={bIdx} className="space-y-2 my-2.5 pl-1">
              {block.items.map((item, iIdx) => (
                <li key={iIdx} className="flex items-start gap-2">
                  <span className="text-xs font-extrabold text-tartan-gold shrink-0 mt-0.5">
                    {item.num}.
                  </span>
                  <span className="flex-1">{renderInlineText(item.text)}</span>
                </li>
              ))}
            </ol>
          );
        }

        return null;
      })}
    </div>
  );
};
