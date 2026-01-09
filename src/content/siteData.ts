// src/siteData.ts - Compatible with both Astro and React
const siteDomain = import.meta.env.PUBLIC_SITE_DOMAIN;
import LogoImage from '../assets/koi-crest-logo.png';

export const siteData = {
  title: "Koi Crest",
  legalName: "Koi Crest LLC",
  tagline: "By a Contractor, For Contractors.",
  description: "Owned by a veteran turned contractor who needed to learn all he could to bring Koi Roofing and Solar to the top. We use this exact system to grow our own business — now serving contractors nationwide with proven strategies that actually work in the trades.",
  Logo: LogoImage,
  domain: siteDomain,
  url: `https://${siteDomain}`,
  location: "Serving contractors across the USA",
};