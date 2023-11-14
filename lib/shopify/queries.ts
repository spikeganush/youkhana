const gql = String.raw;

export const productsQuery = gql`
  query Products {
    products(sortKey: TITLE, first: 8) {
      edges {
        node {
          id
          title
          handle
          tags
          description
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
        }
      }
    }
  }
`;
