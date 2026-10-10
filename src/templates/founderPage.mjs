import { layout, breadcrumb } from './shared.mjs';
import { officesSection } from './officesPage.mjs';

/** Owner-confirmed founder, using the family history already present on the site. */
export function founderPage() {
  return layout(
    'Our Founders & Offices',
    /* HTML */ `${breadcrumb('Our Founders & Offices')}
      <section class="container page-intro">
        <p class="eyebrow">THE BEGINNING OF OUR FAMILY STORY</p>
        <h1>Our Founders &amp; Offices</h1>
        <p>Four generations of the Roshan family, and the locations behind our work.</p>
        <a class="text-link" href="#generations">Our generations</a>
        <a class="text-link" href="#offices">Our offices</a>
      </section>
      <section class="section section-muted" id="generations" aria-labelledby="generations-title">
        <div class="container">
          <p class="eyebrow">A FAMILY LEGACY &middot; SINCE 1900</p>
          <h2 id="generations-title">Four generations. One family story.</h2>
          <p>
            From our founder to the fourth generation, the Roshan name connects each chapter of our
            history.
          </p>
          <div
            class="company-slider"
            data-slider
            data-mobile-only
            data-static-slider
            role="region"
            aria-label="Family generations"
          >
            <div
              class="slider-track generation-grid"
              id="slider-company-family"
              tabindex="0"
              aria-label="Family generations; swipe or use arrow keys"
            >
              <article class="generation-card">
                <!-- Replace the monogram with a portrait img inside this frame when a family photograph is supplied. -->
                <div class="generation-portrait" aria-hidden="true"><span>VM</span></div>
                <div class="generation-copy">
                  <p class="eyebrow">FIRST GENERATION / THE BEGINNING</p>
                  <h3>Vali Mohammed Roshan</h3>
                  <p>Great-grandfather</p>
                  <p>
                    Our founder and the first generation of the Roshan family behind Roshan
                    Industries.
                  </p>
                </div>
              </article>
              <article class="generation-card">
                <!-- Replace the monogram with a portrait img inside this frame when a family photograph is supplied. -->
                <div class="generation-portrait" aria-hidden="true"><span>AR</span></div>
                <div class="generation-copy">
                  <p class="eyebrow">SECOND GENERATION / A LEGACY CONTINUED</p>
                  <h3>Ahmed Rashid Roshan</h3>
                  <p>Father</p>
                  <p>
                    The second generation in the family story, continuing the legacy of the Roshan
                    name.
                  </p>
                </div>
              </article>
              <article class="generation-card">
                <!-- Replace the monogram with a portrait img inside this frame when a family photograph is supplied. -->
                <div class="generation-portrait" aria-hidden="true"><span>IR</span></div>
                <div class="generation-copy">
                  <p class="eyebrow">THIRD GENERATION / THE NEXT CHAPTER</p>
                  <h3>Imran Roshan</h3>
                  <p>Son</p>
                  <p>The third generation, carrying the family story into its next chapter.</p>
                </div>
              </article>
              <article class="generation-card">
                <!-- Replace the monogram with a portrait img inside this frame when a family photograph is supplied. -->
                <div class="generation-portrait" aria-hidden="true"><span>AM</span></div>
                <div class="generation-copy">
                  <p class="eyebrow">FOURTH GENERATION / LOOKING AHEAD</p>
                  <h3>Abdullah Roshan &amp; Mohammed Roshan</h3>
                  <p>Grandsons</p>
                  <p>
                    The fourth generation of the Roshan family, part of the continuing story and
                    future of Roshan Industries.
                  </p>
                </div>
              </article>
            </div>
            <div class="slider-controls" hidden>
              <button
                type="button"
                data-slider-prev
                aria-controls="slider-company-family"
                aria-label="Previous generation"
              >
                &#8592;</button
              ><span class="slider-position" aria-live="polite"></span
              ><button
                type="button"
                data-slider-next
                aria-controls="slider-company-family"
                aria-label="Next generation"
              >
                &#8594;
              </button>
            </div>
          </div>
        </div>
      </section>
      ${officesSection()}`,
    {
      active: 'founder',
      page: 'founder',
      description:
        'Explore four generations of the Roshan family and our Abdul Rehman Street, Goregaon and Gujarat locations.',
    },
  );
}
