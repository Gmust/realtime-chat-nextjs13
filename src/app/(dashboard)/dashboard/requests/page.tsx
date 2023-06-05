import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { fetchRedis } from '@/helpers/redis';
import { FriendRequests } from '@/components/FriendRequests';

const page = async () => {

  const session = await getServerSession(authOptions);
  if (!session) notFound();

  // ids of people who send the requests
  const incomingSenderIds =
    await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as unknown as string[];

  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
      // @ts-ignore
      const sender =JSON.parse(await fetchRedis('get', `user:${senderId}`) as unknown as User);
      return {
        senderId,
        senderEmail: sender.email,
        senderImage: sender.image
      };
    })
  );


  return (
    <main className='pt-8'>
      <h1 className='text-5xl font-bold mb-8'>Add your friend!</h1>
      <div className='flex flex-col gap-4'>
        <FriendRequests incomingFriendRequests={incomingFriendRequests} sessionId={session.user.id} />
      </div>
    </main>
  );
};

export default page;