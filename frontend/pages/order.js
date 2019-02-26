import PleaseSignIn from '../components/PleaseSignIn';
import Order from '../components/Order';

const OrderPage = ({ query: { id } }) => (
  <div>
    <PleaseSignIn>
      <Order id={id} />
    </PleaseSignIn>
  </div>
);
export default OrderPage;
