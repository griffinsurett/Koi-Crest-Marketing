// src/siteData.ts - Compatible with both Astro and React
const siteDomain = import.meta.env.PUBLIC_SITE_DOMAIN;

export const siteData = {
  title: "Koi Crest Marketing",
  legalName: "Koi Crest LLC",
  description: "At Koi Crest, we specialize in comprehensive digital marketing services including Lead Generation, Content Creation and Social Media Management, etc. We will propel your business past the competition. Kickstart your growth with a free consultation and unlock your business’s potential and help you digitally swim past your competition!",
  domain: siteDomain,
  url: `https://${siteDomain}`,
  location: "New Jersey, USA",
  address: "123 Main St, Springfield, NJ 07081",
};

export const ctaData = {
  text: "Get Started with Greastro",
  link: "/contact-us",
}