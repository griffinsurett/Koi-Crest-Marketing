// src/siteData.ts - Compatible with both Astro and React
const siteDomain = import.meta.env.PUBLIC_SITE_DOMAIN;

export const siteData = {
  title: "Greastro",
  legalName: "Greastro LLC",
  description: "Finest Typesafe Static Sites with Astro, dynamically static with content collections.",
  domain: siteDomain,
  url: `https://${siteDomain}`,
  location: "New Jersey, USA",
  address: "123 Main St, Springfield, NJ 07081",
};

export const ctaData = {
  text: "Get Started with Greastro",
  link: "/contact-us",
}