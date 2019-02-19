import Link from 'next/link';

const Nav = () => (
  <div>
    <Link href="/sell">
      <a>
        <p>Sell!</p>
      </a>
    </Link>
    <Link href="/">
      <a>
        <p>Home!</p>
      </a>
    </Link>
  </div>
);
export default Nav;
