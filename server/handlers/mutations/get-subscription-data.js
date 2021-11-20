import "isomorphic-fetch";
import { gql } from "apollo-boost";

export function RECURRING_CREATE__SINGLE(url, shopName, host) {
  const validHost = Buffer.from(shopName + "/admin").toString("base64");
  return gql`
    mutation {
      appSubscriptionCreate(
        name: "SINGLE"
        returnUrl: "${url}?shop=${shopName}&host=${validHost}",
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: { amount: 30, currencyCode: USD }
              }
            }
          }
        ]
      ) {
        userErrors {
          field
          message
        }
        confirmationUrl
        appSubscription {
          id
        }
      }
    }`;
}

export function RECURRING_CREATE__PRO(url, shopName, host) {
  const validHost = Buffer.from(shopName + "/admin").toString("base64");
  console.log(validHost);
  return gql`
    mutation {
      appSubscriptionCreate(
        name: "PRO"
        returnUrl: "${url}?shop=${shopName}&host=${validHost}",
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: { amount: 50, currencyCode: USD }
              }
            }
          }
        ]
      ) {
        userErrors {
          field
          message
        }
        confirmationUrl
        appSubscription {
          id
        }
      }
    }`;
}
export const getSubscriptionData = async (
  ctx,
  client,
  plan,
  shopName,
  host
) => {
  return await client
    .mutate({
      mutation:
        plan === "PRO"
          ? RECURRING_CREATE__PRO(process.env.HOST, shopName, host)
          : RECURRING_CREATE__SINGLE(process.env.HOST, shopName, host),
    })
    .then((response) => response.data.appSubscriptionCreate);
};
