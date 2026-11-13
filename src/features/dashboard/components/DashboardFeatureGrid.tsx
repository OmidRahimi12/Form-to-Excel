import { useId } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { NavigationKey } from '../../../app/navigation';
import { DashboardFeatureCard } from './DashboardFeatureCard';

export interface DashboardFeature {
  to: string;
  key: NavigationKey;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function DashboardFeatureGrid({ title, features }: { title: string; features: DashboardFeature[] }) {
  const titleId = useId();
  return <section className="dashboard-features" aria-labelledby={titleId}>
    <h2 className="dashboard-section-title" id={titleId}>{title}</h2>
    <ul className="dashboard-feature-list">
      {features.map((feature) => <DashboardFeatureCard key={feature.key} to={feature.to} title={feature.title} description={feature.description} icon={feature.icon} />)}
    </ul>
  </section>;
}
