'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Edit3, Image as ImageIcon } from 'lucide-react';
import { EditableCmsBlock } from '@/types/spud';

interface EditableElementProps {
  id: string;
  defaultContent?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'button' | 'a' | 'blockquote' | 'div';
  className?: string;
  label?: string;
  section?: string;
  isImage?: boolean;
  defaultImageUrl?: string;
  defaultAlt?: string;
  defaultLinkUrl?: string;
  defaultButtonColor?: string;
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
  defaultLinkUrl,
  defaultButtonColor,
  children,
}) => {
  const { isMounted, isVisualEditMode, cmsBlocks, setEditingBlock } = useApp();

  const canEdit = isMounted && isVisualEditMode;
  const block = cmsBlocks.find(b => b.id === id);
  const content = block ? block.content : defaultContent;
  const imageUrl = block?.imageUrl || defaultImageUrl;
  const altText = block?.altText || defaultAlt;
  const linkUrl = block?.linkUrl || defaultLinkUrl;
  const buttonColor = block?.buttonColor || defaultButtonColor;

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
      imageUrl,
      linkUrl,
      buttonColor
    };

    setEditingBlock(currentBlock);
  };

  if (isImage) {
    const fit = block?.imageFit || 'cover';
    const posX = block?.imagePositionX !== undefined ? block.imagePositionX : 50;
    const posY = block?.imagePositionY !== undefined ? block.imagePositionY : 50;
    const scale = block?.imageScale !== undefined ? block.imageScale : 1.0;

    return (
      <div className={`relative group overflow-hidden ${canEdit ? 'ring-2 ring-tartan-gold ring-dashed rounded-lg p-1' : ''}`}>
        {canEdit && (
          <button
            onClick={handleEditClick}
            className="absolute top-2 right-2 z-30 bg-tartan-gold text-tartan-dark px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg hover:bg-yellow-400 transition-all scale-95 group-hover:scale-105"
            title="Edit Image, Framing, Fit & Position"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Edit & Frame Image</span>
          </button>
        )}
        <div className="w-full h-full overflow-hidden flex items-center justify-center">
          <img 
            src={imageUrl || defaultImageUrl} 
            alt={altText} 
            className={className} 
            style={{
              objectFit: fit as any,
              objectPosition: `${posX}% ${posY}%`,
              transform: scale !== 1 ? `scale(${scale})` : undefined,
              transformOrigin: `${posX}% ${posY}%`,
              transition: 'transform 0.15s ease, object-position 0.15s ease'
            }}
          />
        </div>
      </div>
    );
  }

  const activeTag = (block?.tag && block.tag !== 'image' ? block.tag : tag) as keyof JSX.IntrinsicElements;
  const Tag = activeTag || 'p';

  const isInline = tag === 'span' || tag === 'a';
  const colorClass = buttonColor ? buttonColor : '';
  const finalClassName = `${className} ${colorClass}`.trim();

  return (
    <span className={`relative group ${isInline ? 'inline-block' : 'block w-full'} ${canEdit ? 'ring-2 ring-tartan-gold/70 ring-dashed rounded-lg p-1 my-0.5 bg-tartan-navy/20' : ''}`}>
      {canEdit && (
        <span className="absolute -top-3 right-0 z-30 inline-flex items-center gap-1">
          <button
            type="button"
            onClick={handleEditClick}
            className="bg-tartan-gold text-tartan-dark px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-lg hover:bg-yellow-400 transition-all opacity-90 hover:opacity-100 ring-1 ring-tartan-dark"
            title={`Edit Element, Tag, Link & Color (<${String(activeTag).toUpperCase()}>)`}
          >
            <Edit3 className="w-2.5 h-2.5" />
            <span className="uppercase font-mono">&lt;{String(activeTag)}&gt;</span>
          </button>
        </span>
      )}
      {activeTag === 'a' ? (
        <a href={linkUrl || '#'} className={finalClassName} onClick={linkUrl?.startsWith('#') ? (e) => {
          e.preventDefault();
          const target = document.getElementById(linkUrl.replace('#', ''));
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        } : undefined}>
          {children || content}
        </a>
      ) : (
        <Tag className={finalClassName}>
          {children || content}
        </Tag>
      )}
    </span>
  );
};
