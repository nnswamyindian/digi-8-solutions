import ServicePage from '../ServicePage';
import { divisions } from '../../data/servicesData';

export default function TechnologyInfrastructure() {
  const div = divisions.find(d => d.id === 'technology')!;

  const pricing = [
    {
      name: 'Basic Digital Presence',
      features: ['Corporate Website', 'Standard Hosting', 'Domain Registration', 'Basic SSL Security'],
    },
    {
      name: 'Pro E-Commerce & Systems',
      features: ['E-Commerce Platform', 'CRM Integration', 'Payment Gateways', 'Premium Cloud Hosting', 'Monthly Maintenance'],
      popular: true,
    },
    {
      name: 'Enterprise Tech',
      features: ['Custom Mobile App (iOS/Android)', 'Full ERP Setup', 'AI Automation', 'Dedicated Server', '24/7 Priority Support'],
    }
  ];
  
  return (
    <ServicePage
      title={div.title}
      tagline="Powering the Future of Your Business"
      description={div.desc}
      overview="A strong digital foundation is the key to business scalability. We provide end-to-end technology solutions that help businesses establish a robust digital presence, automate operations, and scale efficiently."
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
