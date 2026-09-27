# Verigrity — Truth with Integrity

Free, no-signup digital verification and research tools designed for evidence-first use.

## Included tools

- Website Trust Checker — technical and visible trust signals, with limitations.
- Source Verifier — source-page evidence with a server-assisted scan and browser fallback.
- AI Fact Check Tool — structured research workflow; does not pretend text alone proves truth.
- Image Truth Tool — local file properties and available metadata/marker evidence; no false AI-authenticity guarantee.
- Document Integrity — local SHA-256 file identity for any selectable file type, plus browser-level file information.
- Email Spoof Checker — SPF/DKIM/DMARC evidence from supplied raw headers.

## Free access

The public tools have no account requirement and no paywall.

## Accuracy and limitations

Verigrity reports observable evidence. It does not certify websites, people, businesses, documents, signatures, images, emails or claims. Metadata can be missing or altered. Authentication results can be incomplete. A hash proves byte identity, not authorship or truth.

## AdSense readiness

The site includes an About page, T.O. independent-researcher attribution, Contact page, Privacy Policy, Cookie Notice, Terms, Disclosure, Methodology, clear navigation, original editorial content, and educational AI-generated illustrations.

AdSense approval is never guaranteed. Before enabling Google advertising, replace/configure any site-specific consent, publisher, verification and ad settings required for the actual deployment and jurisdiction. Do not add placeholder AdSense publisher IDs to `ads.txt`.

Google's current requirements should be reviewed before monetization, including privacy disclosures, ad placement rules, original-content requirements and publisher policies.

## SEO

The project includes `robots.txt`, `sitemap.xml`, canonical/metadata markup where applicable, structured data on articles, internal navigation, and 50 evergreen articles. Do not mass-generate additional pages solely to target keywords; expand content when it provides real user value.

## Vercel

Deploy the project root to Vercel. Node.js serverless endpoints live in `/api`. The static site and API are designed for Vercel's standard Node runtime.

## Production checks before launch

1. Deploy to Vercel.
2. Verify DNS and HTTPS.
3. Test every tool from the live domain.
4. Add the actual Search Console verification token.
5. Configure a compliant consent-management solution if required by your users' jurisdictions and ad products.
6. Only then add the actual AdSense code/publisher settings.
