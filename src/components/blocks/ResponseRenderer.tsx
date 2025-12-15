'use client';

import { StrategicBridge } from './StrategicBridge';
import { HeroVideo } from './HeroVideo';
import { CaseStudyCard } from './CaseStudyCard';
import { CaseStudyGrid } from './CaseStudyGrid';
import { ThoughtLeadership } from './ThoughtLeadership';
import { CTABlock } from './CTABlock';
import type { LayoutBlock, Asset } from '@/types';

interface ResponseRendererProps {
  layout: LayoutBlock[];
  assets: Asset[];
}

export function ResponseRenderer({ layout, assets }: ResponseRendererProps) {
  // Create a map of asset IDs to assets for quick lookup
  const assetMap = new Map(assets.map(a => [a.id, a]));
  
  return (
    <div className="w-full">
      {layout.map((block, index) => {
        switch (block.type) {
          case 'strategic_bridge':
            return (
              <StrategicBridge 
                key={`${block.type}-${index}`} 
                narrative={block.content || ''} 
              />
            );
          
          case 'hero_video':
            const videoAsset = block.asset_id ? assetMap.get(block.asset_id) : null;
            if (!videoAsset) return null;
            return (
              <HeroVideo 
                key={`${block.type}-${index}`} 
                asset={videoAsset} 
              />
            );
          
          case 'case_study_card':
            const cardAsset = block.asset_id ? assetMap.get(block.asset_id) : null;
            if (!cardAsset) return null;
            return (
              <div key={`${block.type}-${index}`} className="w-full max-w-2xl mx-auto mb-12">
                <CaseStudyCard asset={cardAsset} />
              </div>
            );
          
          case 'case_study_grid':
            const gridAssetIds = (block.props?.asset_ids as string[]) || [];
            const gridAssets = gridAssetIds
              .map(id => assetMap.get(id))
              .filter((a): a is Asset => a !== undefined);
            if (gridAssets.length === 0) return null;
            return (
              <CaseStudyGrid 
                key={`${block.type}-${index}`} 
                assets={gridAssets} 
              />
            );
          
          case 'article_preview':
          case 'thought_leadership':
            const articleAsset = block.asset_id ? assetMap.get(block.asset_id) : null;
            if (!articleAsset) return null;
            return (
              <ThoughtLeadership 
                key={`${block.type}-${index}`} 
                asset={articleAsset} 
              />
            );
          
          case 'cta':
            return (
              <CTABlock 
                key={`${block.type}-${index}`} 
                variant={(block.props?.variant as 'primary' | 'secondary') || 'primary'} 
              />
            );
          
          default:
            console.warn(`Unknown block type: ${block.type}`);
            return null;
        }
      })}
    </div>
  );
}