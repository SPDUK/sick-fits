import PleaseSignIn from '../components/PleaseSignIn';
import OrderList from '../components/OrderList.js';

const OrderPage = props => (
  <div>
    <PleaseSignIn>
      <OrderList />
    </PleaseSignIn>
  </div>
);
export default OrderPage;
