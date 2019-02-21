// Page is a component that wraps any page, such as meta tags, navbar etc.
// Component is whichever page component we pass in
import App, { Container } from 'next/app';
import { ApolloProvider } from 'react-apollo';
import Page from '../components/Page';
import withData from '../lib/withData';

class MyApp extends App {
  // special nextjs lifecycle method that runs first before first render
  // anything returned is exposed via props
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    // exposes the query to the user
    pageProps.query = ctx.query;
    return { pageProps };
  }

  render() {
    const { Component, apollo, pageProps } = this.props;
    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Page>
            <Component {...pageProps} />
          </Page>
        </ApolloProvider>
      </Container>
    );
  }
}

// export the app wrapped in the withData function, gives the appollo client
// accessible via this.props
export default withData(MyApp);
