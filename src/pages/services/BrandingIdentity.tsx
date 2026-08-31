import ServicePage from '../ServicePage';
import { divisions } from '../../data/servicesData';

export default function BrandingIdentity() {
  const div = divisions.find(d => d.id === 'branding')!;
  
  const pricing = [
    {
      name: 'Essential Brand',
      features: ['Primary Logo Design', 'Basic Color Palette', 'Standard Typography', '2 Revisions'],
    },
    {
      name: 'Professional Identity',
      features: ['Full Logo Suite', 'Comprehensive Brand Guidelines', 'Business Stationery Design', 'Social Media Kit', 'Unlimited Revisions'],
      popular: true,
    },
    {
      name: 'Enterprise Brand',
      features: ['Everything in Professional', 'Company Profile Design', 'Packaging Design', 'Brand Strategy Session', 'Priority Support'],
    }
  ];
  
  return (
    <ServicePage
      title={div.title}
      tagline="Build a Powerful First Impression"
      description={div.desc}
      overview="Your brand is more than just a logo—it is the personality, identity, and reputation of your business. We help create a professional, memorable, and trustworthy brand identity that stands out in today's competitive market."
      color={div.color}
      icon={<div.icon size={24} />}
      heroImage={div.img}
      categories={div.subServices.map(sub => ({
        title: sub.name,
        items: sub.features
      }))}
      pricing={pricing}
    />
  );
}
