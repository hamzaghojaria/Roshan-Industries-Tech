import { esc, officeLocation } from './shared.mjs';

/** Location roles supplied by the owner; only confirmed street addresses are published. */
export function officesSection() {
  const locations = [
    {
      name: 'Abdul Rehman Street',
      role: 'Retail Office',
      business: 'Vali Mohammed Roshan Traders',
      directions: 'https://share.google/xG83Rfv9Ef2J0Idlq',
      address:
        '58 Abdul Rehman Street, Opposite SBI Bank, Pydhonie, Masjid Bunder, Mumbai - 400003, Maharashtra',
      copy: 'Contact our retail office for product enquiries, availability and quotations.',
      message:
        'Hello Vali Mohammed Roshan Traders,\n\nI would like to enquire about your Retail Office at Abdul Rehman Street. Please share product availability, pricing and visiting hours.\n\nProduct or requirement:\nQuantity:\nPreferred visit date:\nName:\nPhone:',
    },
    {
      name: 'Goregaon',
      role: 'Manufacturing Unit',
      copy: 'Speak with our team about manufacturing requirements, drawings, samples and custom products.',
      address: officeLocation.address,
      directions: officeLocation.directionsUrl,
      message:
        'Hello Roshan Industries,\n\nI would like to enquire about your Manufacturing Unit at Goregaon. Please help me discuss a custom manufacturing requirement or arrange a visit.\n\nProduct or drawing details:\nMaterial and dimensions:\nQuantity:\nPreferred visit date:\nName:\nPhone:',
    },
    {
      name: 'Gujarat',
      role: 'Plant',
      copy: 'Contact our team for plant location details and visit enquiries.',
      message:
        'Hello Roshan Industries,\n\nI would like to enquire about your Plant in Gujarat. Please share the full plant address, visiting hours and how to arrange a visit.\n\nPurpose of enquiry:\nPreferred visit date:\nName:\nPhone:',
    },
  ];
  return `<section class="section container" id="offices" aria-labelledby="offices-title"><p class="eyebrow">OUR LOCATIONS</p><h2 id="offices-title">Our Offices</h2><p>Our retail office, manufacturing unit and plant. Contact our team to connect with the right location.</p></section>
      <section class="section container company-slider office-slider" data-slider data-mobile-only data-static-slider aria-label="Roshan Industries locations"><div class="slider-track office-grid" id="slider-company-offices" tabindex="0" aria-label="Office locations; swipe or use arrow keys">
        ${locations
          .map(
            (location, index) =>
              /* HTML */ `<article class="office-card">
                <span class="office-number" aria-hidden="true">0${index + 1}</span>
                <p class="eyebrow">${location.role}</p>
                <h2>${location.name}</h2>
                ${location.business ? `<p><strong>${esc(location.business)}</strong></p>` : ''}
                <p>${location.copy}</p>
                ${location.address ? `<address>${esc(location.address)}</address>` : ''}
                <div class="office-actions">
                  ${location.directions ? `<a class="text-link" href="${esc(location.directions)}" target="_blank" rel="noopener noreferrer">Get directions &#8599;</a>` : ''}
                  <a
                    class="text-link"
                    href="mailto:roshanindustriestech@gmail.com?subject=${encodeURIComponent(location.role + ' enquiry - ' + location.name)}&amp;body=${encodeURIComponent(location.message)}"
                    >Enquire about this location &#8599;</a
                  >
                </div>
              </article>`,
          )
          .join(
            '',
          )}</div><div class="slider-controls" hidden><button type="button" data-slider-prev aria-controls="slider-company-offices" aria-label="Previous office">&#8592;</button><span class="slider-position" aria-live="polite"></span><button type="button" data-slider-next aria-controls="slider-company-offices" aria-label="Next office">&#8594;</button></div>
      </section>
      <section class="section section-muted">
        <div class="container section-head">
          <div>
            <p class="eyebrow">PLAN YOUR ENQUIRY</p>
            <h2>Speak with our team.</h2>
            <p>Contact us for location details or to arrange a visit.</p>
          </div>
          <a class="button button-navy" href="contact.html">Contact Us</a>
        </div>
      </section>`;
}

/** Preserve existing office bookmarks while keeping one company page. */
export function officesPage() {
  return '<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width, initial-scale=1"><title>Our Founders &amp; Offices</title><meta http-equiv=refresh content="0; url=founder.html#offices"><link rel=canonical href=founder.html#offices></head><body><p><a href=founder.html#offices>Our Founders &amp; Offices</a></p></body></html>';
}
