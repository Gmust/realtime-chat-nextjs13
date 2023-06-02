import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/shared/Button';


const Dashboard = async () => {

  const session = await getServerSession(authOptions);

  return (
    <div>

      <Button>Hello</Button>
    </div>
  );
};


export default Dashboard;