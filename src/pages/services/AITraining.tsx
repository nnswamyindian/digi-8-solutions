import ServicePage from '../ServicePage';
import { divisions } from '../../data/servicesData';

export default function AITraining() {
  const div = divisions.find(d => d.id === 'training')!;

  const pricing = [
    {
      name: 'AI Foundations',
      features: ['Introduction to GenAI', 'Basic Prompt Engineering', 'Digital Tools Overview', '1-Day Workshop'],
    },
    {
      name: 'Corporate Productivity',
      features: ['Advanced Prompting Frameworks', 'Workflow Automation setup', 'Role-Based AI Training', '3-Day Immersive Program'],
      popular: true,
    },
    {
      name: 'Leadership Transformation',
      features: ['AI Strategy for Executives', 'Change Management', 'Custom Curriculum Design', 'Post-Training Implementation Support'],
    }
  ];
  
  return (
    <ServicePage
      title={div.title}
      tagline="Upskill Your Team for the Future"
      description={div.desc}
      overview="The future of work belongs to organizations that continuously learn and adapt. We help equip your employees with future-ready skills, practical AI knowledge, digital productivity tools, and modern leadership capabilities."
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
