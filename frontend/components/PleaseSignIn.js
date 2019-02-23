import { Query } from 'react-apollo';
import React from 'react';
import Link from 'next/link';
import { CURRENT_USER_QUERY } from './User';
import Signin from './Signin';

const PleaseSignIn = props => (
  <Query query={CURRENT_USER_QUERY}>
    {({ data, loading }) => {
      if (loading) return <p> Loading...</p>;
      if (!data.me)
        return (
          <div>
            <p>Please Sign in before continuing</p>
            <Signin />
            <Link href={{ pathname: '/signup' }}>
              <a>
                <p>Don't have an account yet? Click here.</p>
              </a>
            </Link>
          </div>
        );
      return props.children;
    }}
  </Query>
);

export default PleaseSignIn;
