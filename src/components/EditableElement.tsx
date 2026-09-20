'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Edit3, Image as ImageIcon } from 'lucide-react';
import { EditableCmsBlock } from '@/types/spud';

interface EditableElementProps {
  id: string;
  defaultContent?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'button';
  className?: string;
  label?: string;
  section?: string;
  isImage?: boolean;
  defaultImageUrl?: string;
  defaultAlt?: string;
  children?: React.ReactNode;
}

export const EditableElement: React.FC<EditableElementProps> = ({
  id,
  defaultContent = '',
  tag = 'p',
  className = '',
  label,
  section = 'general',
  isImage = false,
  defaultImageUrl,
  defaultAlt = 'Spud the Piper',
  children,
}) => {
  const { isMounted, isVisualEditMode, cmsBlocks, setEditingBlock } = useApp();

  const canEdit = isMounted && isVisualEditMode;
  const block = cmsBlocks.find(b => b.id === id);
  const content = block ? block.content : defaultContent;
  const imageUrl = block?.imageUrl || defaultImageUrl;
  const altText = block?.altText || defaultAlt;

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentBlock: EditableCmsBlock = block || {
      id,
      page: 'home',
      section,
      tag: isImage ? 'image' : (tag as any),
      label: label || id,
      content,
      altText,
      imageUrl
    };

    setEditingBlock(currentBlock);
  };

  if (isImage) {
    return (
      <div className={`relative group ${canEdit ? 'ring-2 ring-tartan-gold ring-dashed rounded-lg p-1' : ''}`}>
        {canEdit && (
          <button
            onClick={handleEditClick}
            className="absolute top-2 right-2 z-30 bg-tartan-gold text-tartan-dark px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg hover:bg-yellow-400 transition-all scale-95 group-hover:scale-105"
            title="Edit Image, Alt Tag & SEO"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Edit Image</span>
          </button>
        )}
        <img src={imageUrl || defaultImageUrl} alt={altText} className={className} />
      </div>
    );
  }

  const activeTag = (block?.tag && block.tag !== 'image' ? block.tag : tag) as keyof JSX.IntrinsicElements;
  const Tag = activeTag || 'p';

  return (
    <div className={`relative group ${canEdit ? 'ring-2 ring-tartan-gold/70 ring-dashed rounded-lg p-1.5 my-1 inline-block w-full bg-tartan-navy/10' : ''}`}>
      {canEdit && (
        <div className="absolute -top-3.5 right-1 z-30 flex items-center gap-1">
          <button
            onClick={handleEditClick}
            className="bg-tartan-gold text-tartan-dark px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 shadow-lg hover:bg-yellow-400 transition-all opacity-90 hover:opacity-100 ring-1 ring-tartan-dark"
            title={`Edit Element, Tag & SEO (<${String(activeTag).toUpperCase()}>)`}
          >
            <Edit3 className="w-3 h-3" />
            <span className="uppercase font-mono">&lt;{String(activeTag)}&gt;</span>
          </button>
        </div>
      )}
      <Tag className={className}>
        {children || content}
      </Tag>
    </div>
  );
};
