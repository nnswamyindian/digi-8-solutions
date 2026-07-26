import ServicePage from '../ServicePage';
import { divisions } from '../../data/servicesData';
import ServiceContactForm from '../../components/ServiceContactForm';

export default function DigitalMarketingGrowth() {
  const div = divisions.find(d => d.id === 'marketing')!;

  const pricing = [
    {
      name: 'Local Growth',
      features: ['Local SEO Setup', 'Google Business Profile', 'Basic Social Media Management', 'Monthly Analytics Report'],
    },
    {
      name: 'Performance Marketing',
      features: ['Everything in Local', 'Google & Meta Ads Management', 'Comprehensive SEO', 'Content Creation (4/mo)', 'Conversion Tracking'],
      popular: true,
    },
    {
      name: '360° Brand Domination',
      features: ['Everything in Performance', 'Email/WhatsApp Marketing', 'Influencer Outreach', 'Daily Social Media Posts', 'Dedicated Account Manager'],
    }
  ];
  
  return (
    <ServicePage
      title={div.title}
      tagline="Drive Traffic. Generate Leads. Scale Revenue."
      description={div.desc}
      overview="A great product or service needs the right audience. We craft data-driven, ROI-focused digital marketing strategies to increase your online visibility, attract qualified leads, and drive measurable business growth."
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
