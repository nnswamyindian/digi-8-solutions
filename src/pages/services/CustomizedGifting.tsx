import ServicePage from '../ServicePage';
import { divisions } from '../../data/servicesData';

export default function CustomizedGifting() {
  const div = divisions.find(d => d.id === 'gifting')!;

  const pricing = [
    {
      name: 'Personal Touch',
      features: ['Custom Mugs & Keychains', 'Standard Packaging', 'Single Piece Ordering', 'Basic Personalization'],
    },
    {
      name: 'Premium Appreciation',
      features: ['Employee Swag Kits', 'Custom Apparel (T-Shirts/Hoodies)', 'Premium Gift Boxes', 'Bulk Order Discount'],
      popular: true,
    },
    {
      name: 'Corporate Exclusives',
      features: ['Engraved Wooden & Crystal Gifts', 'Luxury Event Awards', 'Custom Artisan Crafts', 'Dedicated Account Manager'],
    }
  ];
  
  return (
    <ServicePage
      title={div.title}
      tagline="Gifts That Create Lasting Impressions"
      description={div.desc}
      overview="Strengthen relationships with meaningful gifts for special occasions and premium branded merchandise for corporate events. Powered by Anuragini, we deliver bespoke, creative, and memorable gifting experiences."
      color={div.color}
      icon={<div.icon size={24} />}
      heroImage={div.img}
      categories={div.subServices.map(sub => ({
        title: sub.name,
        items: sub.features
      }))}
      pricing={pricing}
      externalLinkCTA={{ text: 'Customize Your Gift', url: '#' }}
    />
  );
}
