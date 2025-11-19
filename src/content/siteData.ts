// src/siteData.ts - Compatible with both Astro and React
const siteDomain = import.meta.env.PUBLIC_SITE_DOMAIN;
import LogoImage from '../assets/koi-crest-logo.png';

export const siteData = {
  title: "Koi Crest",
  legalName: "Koi Crest LLC",
  tagline: "Veteran Owned and Operated Marketing Agency.",
  description: "At Koi Crest, we specialize in comprehensive digital marketing services including Lead Generation, Content Creation and Social Media Management, etc. We will propel your business past the competition. Kickstart your growth with a free consultation and unlock your business’s potential and help you digitally swim past your competition!",
  Logo: LogoImage,
  domain: siteDomain,
  url: `https://${siteDomain}`,
  location: "New Jersey, USA",
};