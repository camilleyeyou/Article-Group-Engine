'use client';
import Link from 'next/link';

import type { Template, Asset, LayoutBlock } from '@/types';
import { KeynoteTemplate } from './KeynoteTemplate';
import { DevRelTemplate } from './DevRelTemplate';
import { ProductLaunchTemplate } from './ProductLaunchTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { RebrandingTemplate } from './RebrandingTemplate';
import { DefaultTemplate } from './DefaultTemplate';

interface TemplateRouterProps {
  template: Template;
  narrative: string;
  assets: Asset[];
  layout: LayoutBlock[];
  query: string;
}

export function TemplateRouter({ template, narrative, assets, layout, query }: TemplateRouterProps) {
  // Route to specific template designs based on slug
  switch (template.slug) {
    case 'keynote-development':
      return <KeynoteTemplate query={query} narrative={narrative} assets={assets} />;
    
    case 'developer-relations':
      return <DevRelTemplate query={query} narrative={narrative} assets={assets} />;
    
    case 'product-launch':
    case 'hard-tech-launch':
    case 'consumer-launch':
      return <ProductLaunchTemplate query={query} narrative={narrative} assets={assets} />;
    
    case 'executive-messaging':
    case 'investor-communications':
    case 'analyst-relations':
      return <ExecutiveTemplate query={query} narrative={narrative} assets={assets} />;
    
    case 'rebranding':
    case 'brand-design':
      return <RebrandingTemplate query={query} narrative={narrative} assets={assets} />;
    
    // Use default template for others (we'll add more unique templates later)
    default:
      return (
        <DefaultTemplate 
          template={template}
          query={query} 
          narrative={narrative} 
          assets={assets}
        />
      );
  }
}
