import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Head from 'next/head';
import Link from 'next/link';
import PaginationStyles from './styles/PaginationStyles';
import { perPage } from '../config';

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;
export default function Pagination(props) {
  return (
    <Query query={PAGINATION_QUERY}>
      {({ data, loading, error }) => {
        if (loading) return <p>Loading...</p>;
        const { count } = data.itemsConnection.aggregate;
        const { page } = props;
        const pages = Math.ceil(count / perPage);
        return (
          <PaginationStyles>
            <Head>
              <title>
                Sick Fits | page {page} of {pages}
              </title>
            </Head>
            <Link
              prefetch
              href={{ pathname: 'items', query: { page: page - 1 } }}
            >
              <a aria-disabled={page <= 1} className="prev">
                Prev
              </a>
            </Link>
            <p>
              Page {page} of {pages || 1}
            </p>
            <p>{count} Items Total</p>
            <Link
              prefetch
              href={{ pathname: 'items', query: { page: page + 1 } }}
            >
              <a aria-disabled={page >= pages} className="next">
                Next
              </a>
            </Link>
          </PaginationStyles>
        );
      }}
    </Query>
  );
}
