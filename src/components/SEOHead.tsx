import { useEffect } from 'react';

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
    type?: string;
    schema?: Record<string, unknown>;
}

export default function SEOHead({
    title = 'Digi-8 Solutions — Corporate Digital Transformation Platform',
    description = 'DIGI8 SOLUTIONS INDIA PRIVATE LIMITED is your all-in-one corporate digital transformation partner offering Web Development, Mobile Apps, Branding, Digital Marketing, Cyber Security, Startup Advisory, Printing & Gifting.',
    keywords = 'Digi-8 Solutions, Web Development India, Corporate Digital Transformation, IT Services Mumbai, Enterprise Software, Mobile App Development, Digital Marketing, Cyber Security, Startup Growth, Corporate Gifting',
    canonicalUrl = 'https://digi8solutions.com',
    ogImage = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    type = 'website',
    schema
}: SEOHeadProps) {
    useEffect(() => {
        // Update Title
        document.title = title;

        // Update Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', description);

        // Update Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', keywords);

        // Update OpenGraph Title
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
            ogTitle = document.createElement('meta');
            ogTitle.setAttribute('property', 'og:title');
            document.head.appendChild(ogTitle);
        }
        ogTitle.setAttribute('content', title);

        // Update OpenGraph Description
        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (!ogDesc) {
            ogDesc = document.createElement('meta');
            ogDesc.setAttribute('property', 'og:description');
            document.head.appendChild(ogDesc);
        }
        ogDesc.setAttribute('content', description);

        // Update OpenGraph Image
        let ogImg = document.querySelector('meta[property="og:image"]');
        if (!ogImg) {
            ogImg = document.createElement('meta');
            ogImg.setAttribute('property', 'og:image');
            document.head.appendChild(ogImg);
        }
        ogImg.setAttribute('content', ogImage);

        // Update Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', canonicalUrl);

        // Update Dynamic JSON-LD Schema
        let schemaScript = document.getElementById('dynamic-jsonld-schema');
        if (schema) {
            if (!schemaScript) {
                schemaScript = document.createElement('script');
                schemaScript.setAttribute('id', 'dynamic-jsonld-schema');
                schemaScript.setAttribute('type', 'application/ld+json');
                document.head.appendChild(schemaScript);
            }
            schemaScript.textContent = JSON.stringify(schema);
        } else if (schemaScript) {
            schemaScript.remove();
        }
    }, [title, description, keywords, canonicalUrl, ogImage, type, schema]);

    return null;
}
