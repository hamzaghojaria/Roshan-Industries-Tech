// Editorial descriptions explain use without inventing technical specifications.
const uses = {
  'eye-loupes':
    'For close visual inspection during watchmaking and small-component work. Choose the listed style and magnification to suit your working setup.',
  screwdrivers:
    'For screw work at the watchmaker’s bench. Confirm the tip style, size and any included replacement parts against your application before ordering.',
  'case-openers':
    'For watch-case opening and service work. Check the opening method and case compatibility with our team before selecting a model.',
  'link-strap-tools':
    'For bracelet, strap and pin work during watch servicing. The correct tool depends on the fastening system and dimensions of the assembly.',
  'glass-hand-tools':
    'For watch-glass or hand-fitting work. Confirm the tool or base size and its compatibility with your watch and existing equipment.',
  'clock-keys':
    'For clock-winding applications. Match the key opening and style to the clock’s winding arbor; contact us to confirm the required size.',
  'clock-parts':
    'A component or accessory in our clock-work range. Share the assembly details and dimensions so our team can help confirm the appropriate option.',
  'jewellery-tools':
    'For jewellery bench work and small-part handling. Discuss the intended task and working dimensions with our team to confirm suitability.',
  'soldering-tools':
    'For supporting a soldering or jewellery bench setup. Confirm the holder arrangement, working dimensions and intended use before ordering.',
  tweezers:
    'For small-part handling at the workbench. Select the listed model and size for your task; cell-testing versions should be checked for the required battery range.',
  'oiling-tools':
    'For organising or applying lubricant during watch servicing. Choose the listed cup or pin arrangement to suit your bench routine.',
  'holders-stands':
    'For holding parts or organising tools at the workbench. Check the holder dimensions, capacity and compatibility with the items you plan to use.',
  'gauges-selectors':
    'For sizing, comparison or selection tasks at the bench. Confirm the scale or selector range against the components you need to identify.',
  'trays-storage':
    'For keeping small parts organised or covered during bench work. Confirm the dimensions and arrangement you need with our team.',
  compasses:
    'A compass model pictured in the Roshan Industries catalogue. Ask our team to confirm its dimensions, markings and intended application.',
};
/** Combine an item identity, application guidance and printed variant details. */
export function describeProduct(p) {
  const split = p.name.split(' — '),
    variant = split.slice(1).join(' — ');
  let use = uses[p.categoryId];
  if (/dust cover|lid cover/i.test(p.name))
    use =
      'For covering small parts or a bench setup between tasks. Confirm the cover dimensions and clearance needed for your application.';
  if (/cell tester/i.test(p.name))
    use =
      'For battery-testing work at the watchmaker’s bench. Confirm the supported battery type, voltage range and operating method with our team.';
  if (/ring gauge|finger gauge|bangle size|ring stick/i.test(p.name))
    use =
      'For comparing ring or bangle sizes during jewellery work. Confirm the marked sizing scale and its suitability for your sizing system.';
  if (/stand|holder/i.test(p.name) && p.categoryId === 'screwdrivers')
    use =
      'A screwdriver set with a stand for organising tools at the watchmaker’s bench. Confirm the included tools and their tip sizes before ordering.';
  const intro = `${split[0]} is part of Roshan Industries’ ${p.category.toLowerCase()} range.`;
  const detail = p.id === 'p05-03'
    ? 'This version has three slots through the centre, as shown in the catalogue photograph.'
    : p.id === 'p05-04'
      ? 'This version has a solid centre and numbered notches around its edge, as shown in the catalogue photograph.'
      : variant ? `The catalogue lists this entry as ${variant}.` : '';
  return [intro, use, detail].filter(Boolean).join(' ');
}
