import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Car,
  Fuel,
  Zap,
  Home,
  HeartPulse,
  GraduationCap,
  Film,
  Plane,
  Sparkles,
  Tv,
  CreditCard,
  ShieldCheck,
  Gift,
  Users,
  Briefcase,
  Laptop,
  Store,
  TrendingUp,
  Award,
  DollarSign,
  HelpCircle,
  Smartphone,
  Banknote,
  Building,
  Wallet,
  MoreHorizontal,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Utensils,
  ShoppingBag,
  Car,
  Fuel,
  Zap,
  Home,
  HeartPulse,
  GraduationCap,
  Film,
  Plane,
  Sparkles,
  Tv,
  CreditCard,
  ShieldCheck,
  Gift,
  Users,
  Briefcase,
  Laptop,
  Store,
  TrendingUp,
  Award,
  DollarSign,
  HelpCircle,
  Smartphone,
  Banknote,
  Building,
  Wallet,
  MoreHorizontal,
};

interface Props extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<Props> = ({ name, ...props }) => {
  const IconComponent = ICON_MAP[name] || DollarSign;
  return <IconComponent {...props} />;
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
