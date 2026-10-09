// Generate the aboutPage route using shared accessible components.
import {
  categories,
  productCount,
  customSection,
  categoryCard,
  layout,
  breadcrumb,
  homeSlider,
} from './shared.mjs';

/** Company heritage, current product range and custom manufacturing approach. */
export function aboutPage(products) {
  return layout(
    'About Us',
    /* HTML */ `${breadcrumb('About Us')}
      <section class="container page-intro">
        <p class="eyebrow">QUALITY HAS A NAME</p>
        <h1>A heritage built around the details.</h1>
        <p>
          Watch parts manufacturing, specialist tools and precision machined components from Roshan
          Industries in Mumbai.
        </p>
      </section>
      <section class="section container about-story">
        <div class="about-mark">
          <img src="assets/roshan-logo-new.png" alt="Roshan Industries" width="260" height="260" />
          <p>ROSHAN INDUSTRIES</p>
          <span>Mumbai, India</span>
        </div>
        <div>
          <h2>Rooted in Mumbai.<br />Connected to the craft.</h2>
          <p class="lead">Since 1900. Over 125 years of service.</p>
          <p>
            With roots in watch parts manufacturing, Roshan Industries brings together tools and
            components for watchmaking, clockmaking, jewellery, workshop work and precision
            machining.
          </p>
          <p>
            Our range includes inspection loupes, precision screwdrivers, case opening and bracelet
            tools, clock keys, bench holders and accessories for making, maintaining and repairing.
            Our Precision Machining range also includes tube and instrumentation fittings, hydraulic
            and hose fittings, valve bodies and manifolds, pressure gauge accessories and custom
            machined components.
          </p>
          <p>
            Alongside our catalogue, custom product manufacturing is a central part of what we
            offer. Share a drawing, sample, photograph or specification, and speak with our team
            about dimensions, materials, finish, quantity and how the part needs to work.
          </p>
          <p>
            We welcome enquiries from watchmakers, repair workshops, jewellery professionals and
            engineering businesses. Whether you are selecting a catalogue product or developing a
            custom component, our team is your direct point of contact for specifications,
            availability and quotations.
          </p>
        </div>
      </section>
      <section class="section section-muted">
        <div class="container about-numbers">
          <div><strong>125+</strong><span>Years of service &middot; Since 1900</span></div>
          <div><strong>${productCount}</strong><span>Products in our range</span></div>
          <div><strong>${categories.length}</strong><span>Curated product categories</span></div>
        </div>
      </section>
      <section class="section container about-depth">
        <div>
          <p class="eyebrow">WHAT WE DO</p>
          <h2>From the workbench to your next idea.</h2>
          <p>
            Our catalogue covers close inspection, watch-case servicing, bracelet and strap work,
            glass and hand fitting, clock winding, jewellery bench work and small-part organisation.
            It gives customers a practical starting point for discussing the tools and components
            they need.
          </p>
          <p>
            For custom enquiries, we focus the conversation on the product’s application and the
            details that determine its fit: dimensions, tolerances, materials, finish and quantity.
            Each project is discussed individually; specifications, feasibility and timelines are
            agreed with our team.
          </p>
        </div>
        <div>
          <p class="eyebrow">HOW WE WORK WITH YOU</p>
          <h2>Clear requirements. Direct conversations.</h2>
          <p>
            We believe a useful manufacturing enquiry starts with understanding the task. Share the
            problem you are solving as well as the part you want to make, and include any existing
            references.
          </p>
          <p>
            Our Mumbai heritage connects our business to the detailed work of watchmaking and
            related trades. We carry that experience into conversations about both familiar
            catalogue products and new requirements.
          </p>
          <a class="text-link" href="contact.html#custom-enquiry">Talk to us about your project</a>
        </div>
      </section>
      <section
        class="section container leadership-section family-heritage"
        aria-labelledby="leaders-title"
      >
        <div class="family-heading">
          <div>
            <p class="eyebrow">A FAMILY LEGACY &middot; SINCE 1900</p>
            <h2 id="leaders-title">The family behind<br /><em>Roshan Industries.</em></h2>
          </div>
          <p>Four generations.<br />One name. A shared legacy.</p>
        </div>
        <div
          class="home-slider family-slider"
          data-slider
          role="region"
          aria-roledescription="carousel"
          aria-label="The family behind Roshan Industries"
        >
          <div class="family-navigation" aria-label="Explore the family generations" hidden>
            <button
              type="button"
              data-family-index="0"
              aria-controls="slider-generations"
              aria-pressed="true"
            >
              <span>01</span><strong>first generation</strong></button
            ><button
              type="button"
              data-family-index="1"
              aria-controls="slider-generations"
              aria-pressed="false"
            >
              <span>02</span><strong>second generation</strong></button
            ><button
              type="button"
              data-family-index="2"
              aria-controls="slider-generations"
              aria-pressed="false"
            >
              <span>03</span><strong>third generation</strong></button
            ><button
              type="button"
              data-family-index="3"
              aria-controls="slider-generations"
              aria-pressed="false"
            >
              <span>04</span><strong>fourth generation</strong>
            </button>
          </div>
          <div
            class="slider-track"
            id="slider-generations"
            tabindex="0"
            aria-label="Family generations; swipe or use arrow keys"
          >
            <article class="family-chapter" aria-label="first generation">
              <div class="family-emblem" aria-hidden="true">
                <span class="family-emblem-top">ROSHAN INDUSTRIES</span
                ><span class="family-monogram">VM</span
                ><span class="family-emblem-bottom">GENERATION 01</span>
              </div>
              <div class="family-person">
                <p class="eyebrow">FIRST GENERATION <span>/ The beginning</span></p>
                <h3>Vali Mohammed Roshan</h3>
                <p class="family-relationship">Great-grandfather</p>
                <div class="family-signature">
                  <span></span>Part of our story. Part of our future.
                </div>
              </div>
            </article>
            <article class="family-chapter" aria-label="second generation">
              <div class="family-emblem" aria-hidden="true">
                <span class="family-emblem-top">ROSHAN INDUSTRIES</span
                ><span class="family-monogram">AR</span
                ><span class="family-emblem-bottom">GENERATION 02</span>
              </div>
              <div class="family-person">
                <p class="eyebrow">SECOND GENERATION <span>/ A legacy continued</span></p>
                <h3>Ahmed Rashid Roshan</h3>
                <p class="family-relationship">Father</p>
                <div class="family-signature">
                  <span></span>Part of our story. Part of our future.
                </div>
              </div>
            </article>
            <article class="family-chapter" aria-label="third generation">
              <div class="family-emblem" aria-hidden="true">
                <span class="family-emblem-top">ROSHAN INDUSTRIES</span
                ><span class="family-monogram">IR</span
                ><span class="family-emblem-bottom">GENERATION 03</span>
              </div>
              <div class="family-person">
                <p class="eyebrow">THIRD GENERATION <span>/ The next chapter</span></p>
                <h3>Imran Roshan</h3>
                <p class="family-relationship">Son</p>
                <div class="family-signature">
                  <span></span>Part of our story. Part of our future.
                </div>
              </div>
            </article>
            <article class="family-chapter" aria-label="fourth generation">
              <div class="family-emblem" aria-hidden="true">
                <span class="family-emblem-top">ROSHAN INDUSTRIES</span
                ><span class="family-monogram">AM</span
                ><span class="family-emblem-bottom">GENERATION 04</span>
              </div>
              <div class="family-person">
                <p class="eyebrow">FOURTH GENERATION <span>/ Looking ahead</span></p>
                <h3>Abdullah Roshan &amp;<br />Mohammed Roshan</h3>
                <p class="family-relationship">Grandsons</p>
                <div class="family-signature">
                  <span></span>Part of our story. Part of our future.
                </div>
              </div>
            </article>
          </div>
          <div class="slider-controls" hidden>
            <span class="family-explore">EXPLORE OUR GENERATIONS</span
            ><button
              type="button"
              data-slider-prev
              aria-controls="slider-generations"
              aria-label="Previous generation"
            >
              &#8592;</button
            ><span class="slider-position"></span
            ><button
              type="button"
              data-slider-next
              aria-controls="slider-generations"
              aria-label="Next generation"
            >
              &#8594;
            </button>
          </div>
        </div>
      </section>
      ${customSection('', 'about-custom')}
      <section class="section container">
        <div class="section-head">
          <h2>For the work you do.</h2>
          <a class="text-link" href="categories.html">Explore categories</a>
        </div>
        ${homeSlider('about-work', 'Tools for the work you do', [categories[0], categories[5], categories[7], categories[2], categories[10], categories[14]].map((c) => categoryCard(c, products)).join(''))}
      </section>`,
    { active: 'about', page: 'about' },
  );
}
