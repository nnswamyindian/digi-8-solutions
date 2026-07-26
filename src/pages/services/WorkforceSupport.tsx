import ServicePage from '../ServicePage';
import { divisions } from '../../data/servicesData';
import ServiceContactForm from '../../components/ServiceContactForm';

export default function WorkforceSupport() {
  const div = divisions.find(d => d.id === 'workforce')!;

  const pricing = [
    {
      name: 'Basic Staffing',
      features: ['Candidate Sourcing', 'Initial Screening', 'Contract Staffing Support', 'Basic Background Check'],
    },
    {
      name: 'Comprehensive HR',
      features: ['End-to-End Talent Acquisition', 'Payroll Processing', 'Employee Onboarding', 'Virtual Assistant (40hrs/mo)'],
      popular: true,
    },
    {
      name: 'Total HRO',
      features: ['Full HR Outsourcing', 'Performance Management', 'Dedicated Remote Resources', 'Executive Hiring', 'HR Compliance Management'],
    }
  ];
  
  return (
    <ServicePage
      title={div.title}
      tagline="Build a High-Performing Team"
      description={div.desc}
      overview="People are the strongest pillar of any successful enterprise. We provide end-to-end workforce and HR support services to help organizations attract, hire, manage, and retain the right talent."
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
