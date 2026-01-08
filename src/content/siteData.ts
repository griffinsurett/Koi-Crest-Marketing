// src/siteData.ts - Compatible with both Astro and React
const siteDomain = import.meta.env.PUBLIC_SITE_DOMAIN;
import LogoImage from '../assets/koi-crest-logo.png';

export const siteData = {
  title: "Koi Crest",
  legalName: "Koi Crest LLC",
  tagline: "By a Contractor, For a Contractor.",
  description: "We run Koi Roofing and Solar. We use this exact system to grow our own contracting business. Now we're sharing it with you — proven strategies that actually work in the trades.",
  Logo: LogoImage,
  domain: siteDomain,
  url: `https://${siteDomain}`,
  location: "New Jersey, USA",
};