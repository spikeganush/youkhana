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

export const singleProductQuery = gql`
  query SingleProduct($handle: String!) {
    productByHandle(handle: $handle) {
      title
      description
      updatedAt
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 6) {
        edges {
          node {
            url
            altText
          }
        }
      }
    }
  }
`;

export const mutationCheckoutCreate = gql`
  mutation CheckoutCreate($variantId: ID!) {
    checkoutCreate(
      input: { lineItems: { variantId: $variantId, quantity: 1 } }
    ) {
      checkout {
        webUrl
      }
    }
  }
`;
