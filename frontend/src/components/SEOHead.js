import { useEffect } from 'react';

// Default SEO values with local focus on Campo Grande MS
const DEFAULT_TITLE = 'TratorShop - Máquinas Agrícolas em Campo Grande MS | Comprar e Vender Tratores';
const DEFAULT_DESCRIPTION = 'Encontre tratores, colheitadeiras e implementos agrícolas em Campo Grande MS e todo Mato Grosso do Sul. Anuncie grátis no TratorShop.';
const DEFAULT_KEYWORDS = 'tratores Campo Grande, colheitadeiras MS, implementos agrícolas Mato Grosso do Sul, comprar trator Campo Grande, vender trator MS, máquinas agrícolas, agricultura MS';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1758533696874-587c4e62940c?w=1200&h=630&fit=crop';

// SEO Helper Component - Updates meta tags dynamically
export const SEOHead = ({ 
  title, 
  description, 
  image, 
  url,
  type = 'website',
  keywords = ''
}) => {
  useEffect(() => {
    // Update document title
    document.title = title ? `${title} | TratorShop` : DEFAULT_TITLE;
    
    // Helper to update or create meta tag
    const setMeta = (name, content, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    setMeta('description', description || DEFAULT_DESCRIPTION);
    setMeta('keywords', keywords || DEFAULT_KEYWORDS);
    
    // Geo tags for local SEO
    setMeta('geo.region', 'BR-MS');
    setMeta('geo.placename', 'Campo Grande');
    setMeta('geo.position', '-20.4697;-54.6201');
    setMeta('ICBM', '-20.4697, -54.6201');
    
    // Open Graph tags
    setMeta('og:title', title || DEFAULT_TITLE, true);
    setMeta('og:description', description || DEFAULT_DESCRIPTION, true);
    setMeta('og:type', type, true);
    setMeta('og:url', url || window.location.href, true);
    setMeta('og:image', image || DEFAULT_IMAGE, true);
    setMeta('og:site_name', 'TratorShop', true);
    setMeta('og:locale', 'pt_BR', true);
    
    // Twitter Card tags
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title || DEFAULT_TITLE);
    setMeta('twitter:description', description || DEFAULT_DESCRIPTION);
    setMeta('twitter:image', image || DEFAULT_IMAGE);

    // Cleanup function not needed as we want tags to persist
  }, [title, description, image, url, type, keywords]);

  return null;
};

// Generate listing-specific SEO data with local focus
export const getListingSEO = (listing) => {
  if (!listing) return {};
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(price);
  };

  const categoryNames = {
    tratores: 'Trator',
    implementos: 'Implemento',
    colheitadeiras: 'Colheitadeira',
    pecas: 'Peça'
  };

  const title = `${listing.title} - ${formatPrice(listing.price)} em ${listing.city} MS`;
  const description = `${categoryNames[listing.category] || 'Máquina'} ${listing.brand || ''} ${listing.model || ''} ${listing.year || ''} à venda em ${listing.city}, Mato Grosso do Sul. ${listing.condition === 'novo' ? 'Novo' : listing.condition === 'seminovo' ? 'Seminovo' : 'Usado'}. ${listing.hours_used ? listing.hours_used + ' horas de uso.' : ''} Anuncie grátis no TratorShop.`.trim().replace(/\s+/g, ' ');
  
  const keywords = [
    listing.title,
    listing.brand,
    listing.model,
    listing.category,
    listing.city,
    'MS',
    'Mato Grosso do Sul',
    'Campo Grande',
    'máquina agrícola',
    'comprar trator',
    'vender trator',
    'implementos agrícolas'
  ].filter(Boolean).join(', ');

  return { title, description, keywords };
};

// Generate search page SEO data with local focus
export const getSearchSEO = (category, city, search) => {
  const categoryNames = {
    tratores: 'Tratores',
    implementos: 'Implementos Agrícolas',
    colheitadeiras: 'Colheitadeiras',
    pecas: 'Peças Agrícolas'
  };

  let title = 'Máquinas Agrícolas em Campo Grande MS';
  let description = 'Encontre tratores, colheitadeiras e implementos agrícolas em Campo Grande MS e todo Mato Grosso do Sul. Anuncie grátis no TratorShop.';

  if (category && categoryNames[category]) {
    title = `${categoryNames[category]} em ${city || 'Campo Grande'} MS`;
    description = `${categoryNames[category]} à venda em ${city || 'Campo Grande'}, Mato Grosso do Sul. Encontre as melhores ofertas no TratorShop.`;
  }

  if (city) {
    title = category ? `${categoryNames[category]} em ${city} MS` : `Máquinas Agrícolas em ${city} MS`;
    description = `Compre e venda tratores, colheitadeiras e implementos em ${city}, Mato Grosso do Sul. Anuncie grátis no TratorShop.`;
  }

  if (search) {
    title = `${search} em Campo Grande MS | TratorShop`;
    description = `Resultados para "${search}" em Campo Grande MS e Mato Grosso do Sul. Encontre máquinas agrícolas no TratorShop.`;
  }

  return { 
    title, 
    description,
    keywords: `${category || 'máquinas agrícolas'}, ${city || 'Campo Grande'}, MS, Mato Grosso do Sul, comprar trator, vender trator, implementos agrícolas`
  };
};

export default SEOHead;
