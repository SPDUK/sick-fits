import Link from 'next/link';
import CreateItem from '../components/CreateItem';
import Reset from '../components/Reset';

const Sell = props => (
  <div>
    <p>
      Reset your password
      <Reset resetToken={props.query.resetToken} />
    </p>
  </div>
);
export default Sell;
