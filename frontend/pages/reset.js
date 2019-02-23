import Link from 'next/link';
import CreateItem from '../components/CreateItem';
import Reset from '../components/Reset';

const ResetPage = ({ query: { resetToken } }) => (
  <div>
    <p>
      Reset your password
      <Reset resetToken={resetToken} />
    </p>
  </div>
);
export default ResetPage;
