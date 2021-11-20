import ApolloClient from "apollo-boost";
import {ApolloProvider} from "react-apollo";
import App from "next/app";
import {AppProvider} from "@shopify/polaris";
import {Provider, useAppBridge} from "@shopify/app-bridge-react";
import {authenticatedFetch} from "@shopify/app-bridge-utils";
import {Redirect} from "@shopify/app-bridge/actions";
import "@shopify/polaris/dist/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import ClientRouter from "../components/ClientRouter";

function userLoggedInFetch(app, props) {
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    const response = await fetchFunction(uri, options);

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth?host=${props.host}`);
      return null;
    }

    return response;
  };
}

function MyProvider(props) {
  const app = useAppBridge();

  const client = new ApolloClient({
    fetch: userLoggedInFetch(app, props),
    fetchOptions: {
      credentials: "include",
    },
  });

  const Component = props.Component;
  return (
    <ApolloProvider client={client}>
      <Component {...props} />
    </ApolloProvider>
  );
}

class ContentifyApp extends App {
  render() {
    const {Component} = this.props;
    return (
      <AppProvider i18n={translations}>
        <Provider
          config={{
            // @ts-ignore
            apiKey: API_KEY,
            host: this.props.pageProps.host,
            forceRedirect: true,
          }}
        >
          <ClientRouter/>
          <MyProvider Component={Component} {...this.props.pageProps} />
        </Provider>
      </AppProvider>
    );
  }
}

ContentifyApp.getInitialProps = async ({ctx}) => {
  return {
    pageProps: {
      shopOrigin: ctx.query.shop,
      host: ctx.query.host
    }
  };
};

export default ContentifyApp;
