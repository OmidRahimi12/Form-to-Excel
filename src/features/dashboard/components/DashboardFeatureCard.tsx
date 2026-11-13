import { ArrowLeft, ArrowRight, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui';

interface DashboardFeatureCardProps {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function DashboardFeatureCard({ to, title, description, icon: Icon }: DashboardFeatureCardProps) {
  const { i18n } = useTranslation();
  const DirectionArrow = i18n.dir() === 'rtl' ? ArrowLeft : ArrowRight;
  return <li className="dashboard-feature-list__item">
    <Card className="dashboard-feature-card">
      <Link className="dashboard-feature-card__link" to={to}>
        <span className="dashboard-feature-card__icon"><Icon size={22} strokeWidth={1.8} aria-hidden="true" /></span>
        <span className="dashboard-feature-card__copy"><span className="dashboard-feature-card__title">{title}</span><span className="dashboard-feature-card__description">{description}</span></span>
        <DirectionArrow className="dashboard-feature-card__arrow" size={18} aria-hidden="true" />
      </Link>
    </Card>
  </li>;
}
