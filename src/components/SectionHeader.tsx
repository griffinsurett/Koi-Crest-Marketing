import React from 'react';

interface SectionHeaderProps {
    subtitle?: string;
    title: string;
    subtitleTag?: 'p' | 'span' | 'h6' | 'div';
    titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    subtitleClass?: string;
    titleClass?: string;
    containerClass?: string;
    align?: 'left' | 'center' | 'right';
}

export default function SectionHeader({
    subtitle,
    title,
    subtitleTag = 'p',
    titleTag = 'h2',
    subtitleClass = 'text-gray-500 font-semibold h6 tracking-wider',
    titleClass = 'h2 font-bold leading-tight',
    containerClass = 'space-y-4 m-0',
    align = 'left',
}: SectionHeaderProps) {
    const alignmentClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    };

    // Create dynamic tag components
    const SubtitleTag = subtitleTag as keyof JSX.IntrinsicElements;
    const TitleTag = titleTag as keyof JSX.IntrinsicElements;

    return (
        <div className={`${containerClass} ${alignmentClasses[align]}`}>
            {subtitle && (
                <SubtitleTag className={subtitleClass}>
                    {subtitle}
                </SubtitleTag>
            )}
            <TitleTag className={titleClass}>
                {title}
            </TitleTag>
        </div>
    );
}