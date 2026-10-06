// Researched enquiry entries are separate from the verified printed catalogue.
// Explicit entry numbers preserve SKUs when display order or category changes.
const ksb = 'https://www.ksb.com/en-global/centrifugal-pump-lexicon/article/type-of-pump-1117242';
const tapflo = 'https://tapflo.com/en/products/';
const viking = 'https://www.vikingpump.com/spur-gear-pumps';
const watson = 'https://www.wmfts.com/en/industrial/products/';
const entries = [
  [
    1,
    'Centrifugal transfer pump',
    'centrifugal-pumps',
    'KSB_09_Etanorm_mit_Motor_und_Frequenzumrichter.jpg',
    'KSB Aktiengesellschaft, Frankenthal',
    'by-sa/3.0',
    'An impeller-based pump type for liquid transfer. Share your required flow, head and liquid properties so our team can review an appropriate configuration.',
    ksb,
  ],
  [
    2,
    'Submersible water pump',
    'submersible-pumps',
    'Submersible_Water_pump.jpg',
    'Suyash Dwivedi',
    'by-sa/4.0',
    'A compact pump type that operates beneath the water surface. Discuss your tank or water feature, installation depth and required flow before selecting a model.',
    ksb,
  ],
  [
    3,
    'Diaphragm transfer pump',
    'diaphragm-pumps',
    'Tapflo_T50_PEE.jpg',
    'Aleksander Ma',
    'by-sa/4.0',
    'A diaphragm-based transfer pump type. Share the liquid composition, operating conditions and preferred wetted materials so compatibility can be reviewed.',
    tapflo,
  ],
  [
    4,
    'Circulation pump',
    'centrifugal-pumps',
    'Centrifugal_Pump.jpg',
    'Saud',
    'by-sa/4.0',
    'A centrifugal pump type for circulating liquid around a system. Discuss the circuit, liquid temperature and duty requirements when enquiring.',
    ksb,
  ],
  [
    5,
    'Two-stage centrifugal pump',
    'centrifugal-pumps',
    'Two-stage_centrifugal_pump.jpg',
    'Bitjungle',
    'by-sa/4.0',
    'A staged centrifugal pump configuration. The photograph shows a physical cutaway reference. Share your operating head and flow requirements for a suitability review.',
    ksb,
  ],
  [
    6,
    'Submersible drainage pump',
    'submersible-pumps',
    'Submersible_pump.png',
    'PumpExpert',
    'by-sa/4.0',
    'A submersible pump type for drainage and seepage-water applications. Specify the installation area, liquid condition and any solids present before enquiring.',
    ksb,
  ],
  [
    7,
    'Metal-body diaphragm pump',
    'diaphragm-pumps',
    'Tapflo_T70_STT.jpg',
    'Aleksander Ma',
    'by-sa/4.0',
    'A diaphragm pump configuration with a metal body. Discuss the intended fluid, temperature and connection requirements; material suitability must be confirmed for your application.',
    tapflo,
  ],
  [
    8,
    'Sanitary-design diaphragm pump',
    'diaphragm-pumps',
    'Tapflo_T80_SWS.jpg',
    'Aleksander Ma',
    'by-sa/4.0',
    'A sanitary-style diaphragm pump configuration. Share your process, cleaning requirements and connection standard. Any required hygienic certification must be confirmed with the team.',
    'https://tapflo.com/en/product/hygienic-diaphragm-pumps/',
  ],
  [
    9,
    'External gear pump assembly',
    'gear-pumps',
    'Zahnradpumpe_Werdohler_Pumpenfabrik_07.JPG',
    'Archiumtechnica',
    'by-sa/3.0',
    'A positive displacement pump type using meshing gears. The reference photograph shows a dismantled physical assembly. Share fluid viscosity, pressure and drive requirements for review.',
    viking,
  ],
  [
    10,
    'Laboratory peristaltic pump',
    'peristaltic-pumps',
    'Heidolph-schlauchpumpe.jpg',
    'Hannes Grobe',
    'by/3.0',
    'A tube-based pump configuration for controlled liquid transfer at the bench. Discuss your fluid, tubing compatibility and required flow range when enquiring.',
    watson,
  ],
  [
    11,
    'Peristaltic dosing pump',
    'peristaltic-pumps',
    'Peristaltic_pump.jpg',
    'Cjp24',
    'by-sa/3.0',
    'A peristaltic pump configuration for controlled dosing. Share the target delivery rate, fluid properties and duty cycle so the tube and drive requirements can be reviewed.',
    watson,
  ],
  [
    12,
    'Rotary vane vacuum pump',
    'vacuum-pumps',
    'Fruitland_RCF500_Rotary_Vane_Vacuum_Pump.jpg',
    'Gwhite4444',
    'by-sa/4.0',
    'A rotary vane pump type for creating vacuum in a system. Discuss the gas, required vacuum level and operating cycle so our team can review suitable options.',
    'https://www.fruitlandmanufacturing.com/',
  ],
];

// Cover photos reuse a relevant entry; every entry keeps a distinct photo.
export const pumpCategories = [
  [
    'centrifugal-pumps',
    'Centrifugal Pumps',
    1,
    'Liquid transfer, circulation and staged centrifugal pump configurations.',
  ],
  [
    'submersible-pumps',
    'Submersible Pumps',
    6,
    'Compact water-transfer and drainage pump configurations for submerged operation.',
  ],
  [
    'diaphragm-pumps',
    'Diaphragm Pumps',
    3,
    'Transfer, metal-body and sanitary-style diaphragm pump configurations.',
  ],
  [
    'gear-pumps',
    'Gear Pumps',
    9,
    'Positive displacement gear pump assemblies for application enquiries.',
  ],
  [
    'peristaltic-pumps',
    'Peristaltic Pumps',
    10,
    'Tube-based pump configurations for laboratory transfer and controlled dosing.',
  ],
  [
    'vacuum-pumps',
    'Vacuum Pumps',
    12,
    'Rotary vane vacuum pump configurations for process requirements.',
  ],
].map(([id, name, cover, description]) => ({
  id,
  name,
  family: 'Pumps',
  description,
  image: `assets/pumps/${entries.find(([number]) => number === cover)[3]}`,
}));

/** Attach provenance and enquiry status without inventing stock specifications. */
export const pumpProducts = entries.map(
  ([number, name, categoryId, file, author, licence, description, sourceUrl]) => {
    const category = pumpCategories.find((entry) => entry.id === categoryId);
    const sku = `RIT-${String(200 + number).padStart(4, '0')}`;
    return {
      id: `pump-${number}`,
      sku,
      name,
      category: category.name,
      categoryId,
      family: 'Pumps',
      image: `assets/pumps/${file}`,
      url: `products/${sku.toLowerCase()}.html`,
      onlineRange: true,
      nameConfirmed: false,
      imageKind: 'photograph',
      description: `${name}. ${description} Confirm the exact model and availability with Roshan Industries.`,
      note: 'Enquiry range. This is a reference photograph of an actual pump, not Roshan Industries stock. Brand markings identify the photographed equipment; availability and specifications will be confirmed by our team.',
      sourceUrl,
      imageSource: `https://commons.wikimedia.org/wiki/File:${file}`,
      imageCredit: `${author} · CC ${licence.startsWith('by-sa') ? 'BY-SA' : 'BY'} ${licence.split('/')[1]}`,
      imageLicense: `https://creativecommons.org/licenses/${licence}/`,
      imageChanges: 'Wikimedia resized preview; no crop or retouching.',
    };
  },
);
