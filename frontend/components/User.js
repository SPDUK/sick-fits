import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

const CURRENT_USER_QUERY = gql`
  query {
    me {
      email
      id
      name
      permissions
      cart {
        id
        quantity
        item {
          id
          price
          image
          title
          description
        }
      }
    }
  }
`;
// lets us take the payload repsonse of the query and pass it down to the children we render inside
// the <User> component like so:

// <User>
// {data => {
//   console.log(data); // response from query with the user
//   return <p>User</p>;
// }}
// </User>

const User = props => (
  <Query {...props} query={CURRENT_USER_QUERY}>
    {payload => props.children(payload)}
  </Query>
);
User.propTypes = {
  children: PropTypes.func.isRequired,
};
export default User;
export { CURRENT_USER_QUERY };
