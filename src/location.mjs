// The owner's Maps link identifies the selected business, not the other nearby result.
const address =
  'C-20, 1st Singh Industrial Estate, Ram Mandir Road, Near Movie Star Cinema, Goregaon (W), Mumbai - 400 104';
const mapCid = '2993568223158557359'; // 0x298b4a7038435aaf from the selected place.
export const officeLocation = {
  address,
  mapCid,
  embedUrl: `https://www.google.com/maps?cid=${mapCid}&ll=19.1519002,72.8470708&z=17&output=embed`,
  mapLabel: 'Roshan Industries office, Goregaon West, Mumbai',
  directionsUrl: `https://www.google.com/maps?cid=${mapCid}`,
};
