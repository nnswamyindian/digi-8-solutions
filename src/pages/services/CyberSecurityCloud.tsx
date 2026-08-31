import ServicePage from '../ServicePage';
import { divisions } from '../../data/servicesData';

export default function CyberSecurityCloud() {
  const div = divisions.find(d => d.id === 'security')!;

  const pricing = [
    {
      name: 'Security Baseline',
      features: ['Basic Vulnerability Assessment', 'Firewall Configuration', 'SSL Setup', 'Automated Backups'],
    },
    {
      name: 'Advanced Protection',
      features: ['Comprehensive VAPT', 'Endpoint Security', 'Cloud Infrastructure Optimization', 'Disaster Recovery Plan'],
      popular: true,
    },
    {
      name: 'Enterprise Shield',
      features: ['Zero-Trust Architecture', '24/7 Security Monitoring', 'Compliance Standard Setup (ISO 27001)', 'Full Cloud Migration'],
    }
  ];
  
  return (
    <ServicePage
      title={div.title}
      tagline="Secure Your Data. Scale with Confidence."
      description={div.desc}
      overview="In an increasingly digital world, data protection and cloud scalability are non-negotiable. We help organizations safeguard digital assets, secure their IT environments, ensure business continuity, and build scalable cloud infrastructure."
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
