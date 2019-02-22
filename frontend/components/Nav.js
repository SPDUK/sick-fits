import Link from 'next/link';
import NavStyles from './styles/NavStyles';
import User from './User';

// destructures data out of the response to User, then me out of the data
const Nav = () => (
  <NavStyles>
    <User>
      {({ data: { me } }) => {
        if (me.name) return <p> {me.name}</p>;
        return null;
      }}
    </User>
    <Link href="/items">
      <a>Shop</a>
    </Link>
    <Link href="/sell">
      <a>Sell</a>
    </Link>
    <Link href="/signup">
      <a>Sign Up</a>
    </Link>
    <Link href="/orders">
      <a>Orders</a>
    </Link>
    <Link href="/me">
      <a>Accounts</a>
    </Link>
  </NavStyles>
);
export default Nav;
