// Fresh application descriptions for the reviewed high resolution catalogue.
// Listed dimensions and materials remain in the reviewed names; no extra specifications are inferred.
const applications = {
  'eye-loupes':
    'A magnifier for close visual inspection of watch components and small workshop parts. Select the photographed style for your working setup and confirm the required optical variant with Roshan Industries.',
  screwdrivers:
    'A bench tool for controlled screw work during watch servicing and small assembly tasks. Roshan Industries can help confirm the appropriate tip and listed configuration for your application.',
  'case-openers':
    'A servicing tool for working with watch case backs. Discuss the case construction and opening method with Roshan Industries to confirm compatibility before ordering.',
  'link-strap-tools':
    'A workshop tool for bracelet and strap servicing. Share the fastening arrangement and part dimensions with Roshan Industries to confirm the right configuration for your repair work.',
  'glass-hand-tools':
    'A bench accessory for watch glass or hand fitting during assembly and servicing. Confirm the fitting arrangement and compatibility with your watch and equipment through Roshan Industries.',
  'clock-keys':
    'A winding key for mechanical clock servicing. Match the photographed key style and listed size range to the winding arbor, and confirm the required option with Roshan Industries.',
  'clock-parts':
    'A component for clock assembly and maintenance work. Supply the relevant mechanism details and fit requirements to Roshan Industries so the correct catalogue option can be confirmed.',
  'jewellery-tools':
    'A practical tool for jewellery bench work and small component preparation. Discuss the task and required configuration with Roshan Industries before selecting this catalogue item.',
  'soldering-tools':
    'A support accessory for jewellery soldering and workshop bench tasks. Roshan Industries can review the pictured arrangement against your intended setup and handling requirements.',
  tweezers:
    'A tweezer for handling small parts during watch repair and workshop assembly. Confirm the tip arrangement and listed size with Roshan Industries to suit your bench routine.',
  'oiling-tools':
    'An oiling accessory for watch maintenance and organised lubricant handling. Discuss the cup or applicator configuration with Roshan Industries to select the right arrangement for your workbench.',
  'holders-stands':
    'A bench holder or stand for supporting parts and organising tools during workshop tasks. Confirm the listed configuration and fit for your equipment with Roshan Industries.',
  'gauges-selectors':
    'A comparison tool for identifying or checking component sizes at the workbench. Confirm the marked range and the parts you need to compare with Roshan Industries before ordering.',
  'trays-storage':
    'A storage accessory for organising small watch and jewellery parts during bench work. Confirm the pictured layout and required capacity with Roshan Industries for your workshop setup.',
  compasses:
    'A directional compass pictured in the Roshan Industries catalogue. Its dial layout and body shape distinguish this model; contact our team to confirm the required format and available options.',
};
const rules = [
  [
    /auxiliary.*lens/i,
    'An auxiliary lens for use with a compatible eye glass during close component inspection. Roshan Industries can confirm lens suitability for your existing magnifier and the intended workshop task.',
  ],
  [
    /keychain.*eye glass/i,
    'A portable keychain magnifier for examining small details away from the workbench. Confirm the required size and lens option with Roshan Industries before ordering.',
  ],
  [
    /dust cover|lid cover/i,
    'A cover for protecting small parts from dust between workshop operations. Discuss the required clearance and bench arrangement with Roshan Industries to confirm the pictured cover is suitable.',
  ],
  [
    /dividing tray/i,
    'A divided tray for separating small parts during watch servicing and assembly. Confirm the compartment arrangement and workshop requirements with Roshan Industries before selecting this model.',
  ],
  [
    /storage container/i,
    'A container for keeping watch repair parts grouped and accessible at the bench. Discuss your storage needs and required configuration with Roshan Industries before ordering.',
  ],
  [
    /movement holder/i,
    'A holder for supporting a watch movement during inspection and servicing. Match the listed holder style to the movement you work with and confirm fit through Roshan Industries.',
  ],
  [
    /pliers stand|transparent tool stand/i,
    'A stand for keeping pliers and similar bench tools organised and accessible. Confirm the pictured arrangement and tool fit with Roshan Industries for your workshop setup.',
  ],
  [
    /bur stand|poger stand/i,
    'A bench stand for organising burs and small tool accessories. Review the photographed arrangement and confirm the required hole configuration and tool fit with Roshan Industries.',
  ],
  [
    /screwdriver stand/i,
    'A screwdriver stand for organising tools at the watchmaking bench. Check whether the listed configuration includes screwdrivers or the stand alone, and confirm the required arrangement with Roshan Industries.',
  ],
  [
    /battery selector/i,
    'A reference selector for comparing watch battery formats during servicing. Use the photographed chart or selector arrangement as a starting point and confirm the required battery coverage with Roshan Industries.',
  ],
  [
    /side bar selector|side bar and strap gauge/i,
    'A sizing reference for comparing watch side bars and strap fittings. Discuss the parts you need to identify and confirm the marked range with Roshan Industries before ordering.',
  ],
  [
    /ring gauge stand/i,
    'A stand for arranging ring gauges in an orderly bench setup. Confirm the listed positions and compatibility with your gauges through Roshan Industries before selecting this model.',
  ],
  [
    /ring gauge|ring stick|bangle.*gauge|finger gauge/i,
    'A jewellery sizing tool for comparing ring or bangle dimensions. Check the pictured scale against your sizing system and confirm the required variant with Roshan Industries.',
  ],
  [
    /oil pin/i,
    'An applicator for placing lubricant during watch servicing. Confirm the listed single or set arrangement with Roshan Industries to suit your lubrication routine and workshop requirements.',
  ],
  [
    /oil cup/i,
    'An oil cup for holding small quantities of lubricant at the watchmaking bench. Select the photographed cup arrangement and confirm the listed configuration with Roshan Industries.',
  ],
  [
    /work holder/i,
    'A hand held work holder for supporting small items during jewellery bench tasks. Review the pictured holder arrangement and confirm suitability for your workpieces with Roshan Industries.',
  ],
  [
    /melting disc/i,
    'A wooden handled support tool for jewellery heating and bench preparation tasks. Confirm the listed length and intended working setup with Roshan Industries before ordering.',
  ],
  [
    /ceramic clamp/i,
    'A clamp for holding small workpieces during jewellery bench and soldering preparation. Select the listed version with or without a base and confirm the arrangement with Roshan Industries.',
  ],
  [
    /third hand|fourth hand/i,
    'An additional workpiece support for positioning small items during jewellery bench tasks. Check the pictured joints, clamps and base arrangement with Roshan Industries before selecting the listed version.',
  ],
  [
    /torch stand/i,
    'A bench stand for supporting a compatible torch in a workshop setup. Confirm the holder arrangement and suitability for your equipment with Roshan Industries before use.',
  ],
  [
    /link remover replacement|replacement pin|link remover pins/i,
    'A replacement pin accessory for compatible bracelet link removal tools. Confirm the listed pin size and attachment arrangement with Roshan Industries against your existing equipment.',
  ],
  [
    /link remover base|pin block|delrin block/i,
    'A support block for positioning a bracelet during pin removal work. Check the photographed slots and seating arrangement with Roshan Industries to confirm compatibility with your repair setup.',
  ],
  [
    /link remover|pin removal rod/i,
    'A tool for removing bracelet link pins during watch strap adjustment. Match the pictured operating arrangement and listed accessories to the bracelet, and confirm suitability with Roshan Industries.',
  ],
  [
    /side bar|spring bar remover/i,
    'A tool for fitting or removing watch strap spring bars during servicing. Confirm the tip arrangement and compatibility with the watch lugs and fastening system through Roshan Industries.',
  ],
  [
    /GB long/i,
    'A GB long rod configuration listed among the clock workshop components. Share the mechanism reference and required rod format with Roshan Industries to confirm the correct application and fit.',
  ],
  [
    /clock gong/i,
    'A replacement gong for a compatible clock striking mechanism. Select the pictured flat or round configuration and confirm mounting and mechanism fit with Roshan Industries.',
  ],
  [
    /clock hook|MS hook|stabilizer|clock cover|ratchet clip|bopp wire/i,
    'A clock component for maintenance or assembly of a compatible mechanism. Compare the photographed shape with your existing part and discuss fit and mounting requirements with Roshan Industries.',
  ],
  [
    /shovel|diamond tray/i,
    'A jewellery bench accessory for collecting or transferring small loose items. Confirm the photographed shape and required working arrangement with Roshan Industries for your handling task.',
  ],
  [
    /soldering holder|solder tray/i,
    'A bench accessory for supporting jewellery soldering preparation and small workpieces. Confirm the listed base or holder arrangement with Roshan Industries against your workshop setup.',
  ],
  [
    /file holder/i,
    'A wooden handled holder for a compatible file used in bench preparation work. Discuss the file fitting and required handle arrangement with Roshan Industries to confirm a suitable option.',
  ],
  [
    /blade cutter/i,
    'A wooden handled cutting tool for controlled jewellery bench preparation tasks. Confirm the intended material and blade arrangement with Roshan Industries before selecting this model.',
  ],
  [/clock key|key set for wooden/i, applications['clock-keys']],
  [/case.*opener|knife.*opener/i, applications['case-openers']],
  [
    /case holder/i,
    'A holder for supporting a watch case during servicing operations. Confirm the seating arrangement and case compatibility with Roshan Industries before ordering the photographed model.',
  ],
  [/screwdriver set|screwdriver with|screwdriver and/i, applications.screwdrivers],
  [
    /pin holder|pin pusher/i,
    'A hand tool for controlled pin handling during watch and bracelet servicing. Match the working end to the pin and assembly, and confirm the listed configuration with Roshan Industries.',
  ],
  [
    /hand presser|hand fitting|hand press/i,
    'A fitting tool for controlled placement of watch hands during servicing and assembly. Confirm the tip arrangement and suitability for the movement with Roshan Industries before ordering.',
  ],
  [
    /hole punch/i,
    'A punch for preparing holes during watch strap and workshop fitting tasks. Discuss the intended strap material and hole requirements with Roshan Industries to confirm the appropriate configuration.',
  ],
  [
    /Rolex handle/i,
    'A handle listed for compatible watch servicing tools in the catalogue. Confirm the intended attachment and equipment compatibility directly with Roshan Industries before ordering.',
  ],
  [
    /silicone/i,
    'A cushioning accessory for supporting a watch case during bench assembly and servicing. Discuss the pictured cushion arrangement and fit requirements with Roshan Industries for your workshop setup.',
  ],
  [
    /cell testing tweezer|cell tester/i,
    'A battery testing tool for watch servicing and bench checks. Confirm the supported cell format and any listed voltage range with Roshan Industries before selecting this model.',
  ],
  [
    /acid bottle/i,
    'A bottle for a suitable jewellery bench liquid handling setup. Confirm the intended contents and material compatibility with Roshan Industries before filling or using the pictured bottle.',
  ],
  [
    /spanner/i,
    'A spanner set for compatible small fasteners used in bench maintenance work. Confirm the listed set arrangement and required fastener sizes with Roshan Industries before ordering.',
  ],
  [
    /glass fitting machine|delrin.*fitting|delrin base/i,
    'A fitting machine or base for controlled watch glass assembly and servicing. Confirm the listed model and base compatibility with Roshan Industries against your watch and workshop equipment.',
  ],
  [
    /tweezer holder/i,
    'A holder for positioning compatible tweezers in a bench setup. Confirm the photographed attachment and support arrangement with Roshan Industries to match your workshop task.',
  ],
  [
    /ring clamp/i,
    'A clamp for supporting rings during jewellery preparation and finishing work. Confirm the gripping arrangement and suitability for your workpieces with Roshan Industries before ordering.',
  ],
  [
    /mainspring/i,
    'A coiled spring for a compatible clock mechanism. Match the photographed form to your existing assembly and confirm fit and winding requirements with Roshan Industries before ordering.',
  ],
  [
    /strap and lug measuring/i,
    'A measuring reference for comparing watch strap and lug widths during replacement work. Confirm the marked range and required fitting application with Roshan Industries before ordering.',
  ],
];
/** Prefer a specific name rule, then fall back to the reviewed category application. */
export function describeProduct(product) {
  const application =
    rules.find(([pattern]) => pattern.test(product.name))?.[1] || applications[product.categoryId];
  if (!application) throw new Error('No application description for ' + product.sku);
  return `${product.name}. ${application}`;
}
