// Shared by the invitation catalogue and the occasion pages.
export function invitationOfferSchema(offer, url) {
  const price = (offer.cents / 100).toFixed(2);
  return {
    '@type': 'Offer', name: offer.name, price, priceCurrency: 'MXN',
    priceSpecification: {
      '@type': 'PriceSpecification', price, priceCurrency: 'MXN', valueAddedTaxIncluded: true,
      ...(offer.startingAt ? { minPrice: price } : {}),
    },
    url, availability: 'https://schema.org/InStock',
  };
}
