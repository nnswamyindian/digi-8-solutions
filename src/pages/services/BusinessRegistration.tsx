import ServicePage from '../ServicePage';
import { divisions } from '../../data/servicesData';
import ServiceContactForm from '../../components/ServiceContactForm';

export default function BusinessRegistration() {
  const div = divisions.find(d => d.id === 'compliance')!;

  const pricing = [
    {
      name: 'Startup Foundation',
      features: ['Company Incorporation', 'PAN & TAN Registration', 'Basic DSC (Digital Signature)', 'Bank Account Opening Assistance'],
    },
    {
      name: 'Standard Compliance',
      features: ['Everything in Startup', 'GST Registration', 'MSME/Udyam Registration', 'Shop & Establishment License'],
      popular: true,
    },
    {
      name: 'Full Corporate Legal',
      features: ['Everything in Standard', 'Trademark Registration', 'ISO Certification Support', 'Annual ROC Filing', 'EPF/ESI Registration'],
    }
  ];
  
  return (
    <ServicePage
      title={div.title}
      tagline="Start Right. Stay Compliant."
      description={div.desc}
      overview="Navigating the legal and regulatory landscape is a critical step for any business. We offer complete business registration, legal documentation, statutory registrations, IP protection, and compliance services under one roof."
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
