'use client';

import type { Template, Asset } from '@/types';
import { KeynoteTemplate } from './KeynoteTemplate';
import { DevRelTemplate } from './DevRelTemplate';
import { ProductLaunchTemplate } from './ProductLaunchTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { RebrandingTemplate } from './RebrandingTemplate';
import { HardTechTemplate } from './HardTechTemplate';
import { ConsumerTemplate } from './ConsumerTemplate';
import { SalesTemplate } from './SalesTemplate';
import { ThoughtLeadershipTemplate } from './ThoughtLeadershipTemplate';
import { CrisisTemplate } from './CrisisTemplate';
import { DefaultTemplate } from './DefaultTemplate';

interface TemplateRouterProps {
  template: Template;
  narrative: string;
  assets: Asset[];
  query: string;
}

export function TemplateRouter({ template, narrative, assets, query }: TemplateRouterProps) {
  // Route to specific template designs based on slug
  switch (template.slug) {
    case 'keynote-development':
      return <KeynoteTemplate query={query} narrative={narrative} assets={assets} />;
    
    case 'developer-relations':
      return <DevRelTemplate query={query} narrative={narrative} assets={assets} />;
    
    case 'product-launch':
      return <ProductLaunchTemplate query={query} narrative={narrative} assets={assets} />;
    
    case 'hard-tech-launch':
      return <HardTechTemplate query={query} narrative={narrative} assets={assets} />;
    
    case 'consumer-launch':
      return <ConsumerTemplate query={query} narrative={narrative} assets={assets} />;
    
    case 'executive-messaging':
    case 'investor-communications':
    case 'analyst-relations':
      return <ExecutiveTemplate query={query} narrative={narrative} assets={assets} />;
    
    case 'rebranding':
    case 'brand-design':
      return <RebrandingTemplate query={query} narrative={narrative} assets={assets} />;
    
    case 'sales-enablement':
      return <SalesTemplate query={query} narrative={narrative} assets={assets} />;
    
    case 'thought-leadership':
      return <ThoughtLeadershipTemplate query={query} narrative={narrative} assets={assets} />;
    
    case 'crisis-communications':
      return <CrisisTemplate query={query} narrative={narrative} assets={assets} />;
    
    // Use default template for remaining templates
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
