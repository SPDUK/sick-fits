import React, { Component } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import calcTotalPrice from '../lib/calcTotalPrice';
import Error from './ErrorMessage';
import User, { CURRENT_USER_QUERY } from './User';
import CartItem from './CartItem';

function totalItems(cart) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}
export default class TakeMyMoney extends Component {
  onToken = ({ id }) => {
    console.log(id);
  };

  render() {
    return (
      <User>
        {({ data: { me } }) => (
          <StripeCheckout
            name="Sick Fits"
            description={`Order of ${totalItems(me.cart)} items`}
            amount={calcTotalPrice(me.cart)}
            image={me.cart[0].item && me.cart[0].item.image}
            stripeKey="pk_test_o1hg8dMzWOvkewFOSnaXXliq"
            currency="USD"
            email={me.email}
            token={res => this.onToken(res)}
          >
            {this.props.children}
          </StripeCheckout>
        )}
      </User>
    );
  }
}
