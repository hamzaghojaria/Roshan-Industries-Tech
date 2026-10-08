// Generate the contactPage route using shared accessible components.
import {
  officeLocation,
  esc,
  email,
  whatsapp,
  whatsappIcon,
  mail,
  customMail,
  layout,
  breadcrumb,
} from './shared.mjs';

/** Contact details, practical enquiry guidance and custom manufacturing questions. */
export function contactPage() {
  return layout(
    'Contact Us',
    /* HTML */ `${breadcrumb('Contact Us')}
      <section class="container page-intro">
        <p class="eyebrow">LET’S DISCUSS THE DETAILS</p>
        <h1>Contact Roshan Industries.</h1>
        <p>
          Speak with our Mumbai team about catalogue products, precision machined components or
          custom manufacturing. Contact us by email or WhatsApp to discuss your requirements.
        </p>
      </section>
      <section class="container custom-enquiry" id="custom-enquiry">
        <div>
          <p class="eyebrow">CUSTOM MANUFACTURING ENQUIRIES</p>
          <h2>Tell us what you want to make.</h2>
          <p>
            Need a custom part or a product beyond our catalogue? Share a drawing, sample reference
            or photograph, along with its intended use, dimensions and tolerances, preferred
            material and finish, quantity and target timeline. Our team will review the requirement
            and discuss feasibility and the next steps with you.
          </p>
          <a class="button button-navy" href="${esc(customMail())}"
            >Prepare a custom product enquiry</a
          >
        </div>
        <div class="enquiry-checklist">
          <h3>A useful starting point</h3>
          <ul>
            <li>What the product needs to do</li>
            <li>Drawing or reference photographs</li>
            <li>Dimensions and critical tolerances</li>
            <li>Preferred material and finish</li>
            <li>Required quantity and timeline</li>
          </ul>
          <p>Don’t have every detail yet? Start with what you know.</p>
        </div>
      </section>
      <section class="section container contact-layout">
        <div class="contact-primary">
          <p class="eyebrow">EMAIL OUR TEAM</p>
          <h2>Your next project<br />starts here.</h2>
          <a class="contact-email" href="mailto:${email}">${email}</a>
          <p>
            Share the product name or SKU, quantity and required specifications. Include the size,
            material or variant where relevant, along with your contact details and preferred
            timeline. We can then discuss availability and a quotation for your requirement.
          </p>
          <div class="enquiry-actions">
            <a class="button button-navy" href="${esc(mail())}">Prepare an email enquiry</a>
            <a
              class="button whatsapp-link"
              href="${esc(whatsapp())}"
              target="_blank"
              rel="noopener noreferrer"
              >${whatsappIcon}Chat on WhatsApp</a
            >
          </div>
        </div>
        <div class="contact-info">
          <div>
            <span class="eyebrow">LOCATION</span>
            <h3>Goregaon West, Mumbai</h3>
            <address>${esc(officeLocation.address)}</address>
            <a
              class="text-link"
              href="${esc(officeLocation.directionsUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              >Get directions to our office</a
            >
          </div>
          <div>
            <span class="eyebrow">INCLUDE IN YOUR ENQUIRY</span>
            <ul>
              <li>Product name and SKU</li>
              <li>Quantity and size or variant</li>
              <li>Drawings or specifications, if applicable</li>
              <li>Company and contact details</li>
              <li>Preferred timeline</li>
            </ul>
          </div>
          <div>
            <span class="eyebrow">PRODUCT CATALOGUE</span
            ><a
              class="text-link"
              href="assets/roshan-industries-catalogue.pdf"
              download="Roshan-Industries-Catalogue.pdf"
              >Download our product catalogue</a
            >
          </div>
        </div>
      </section>
      <section class="container section custom-faq">
        <p class="eyebrow">BEFORE YOU GET IN TOUCH</p>
        <h2>Custom manufacturing questions</h2>
        <details>
          <summary>Can I enquire about a product outside the catalogue?</summary>
          <p>
            Yes. Roshan Industries offers custom product manufacturing. Share your concept, drawing
            or reference so our team can review the requirement.
          </p>
        </details>
        <details>
          <summary>Do I need a finished technical drawing?</summary>
          <p>
            A drawing is helpful, but you can begin with photographs, a sample reference or a
            description of the intended use. Include the dimensions you already know.
          </p>
        </details>
        <details>
          <summary>What are the minimum order quantity and lead time?</summary>
          <p>
            These depend on the product and requirements. Send the specification and required
            quantity; our team will confirm feasibility, pricing and timing for your enquiry.
          </p>
        </details>
        <details>
          <summary>Can a catalogue product be a starting point?</summary>
          <p>
            Yes. Include the SKU and explain the changes you need. Our team will review whether the
            proposed custom version can be made.
          </p>
        </details>
      </section>`,
    { active: 'contact', page: 'contact' },
  );
}
