import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { fetchRedis } from '@/helpers/redis';
import { messageArrayValidator } from '@/lib/validations/message';

interface ChatPageProps {
  params: {
    chatId: string
  };
}


const getChatMessages = async (chatId: string) => {
  try {
    const results: string[] = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, -1);
    const dbMessages = results.map((message) => JSON.parse(message) as Message);
    const reversedDbMessages = dbMessages.reverse();
    const messages = messageArrayValidator.parse(reversedDbMessages);
    return messages;
  } catch (e) {
    notFound();
  }
};


const page = async ({ params }: ChatPageProps) => {

  const { chatId } = params;
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const { user } = session;

  const [userId1, userId2] = chatId.split('--');

  if (userId1 !== user.id && userId2 !== user.id) {
    notFound();
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1;
  const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User;
  const initialMessages = await getChatMessages(chatId);

  return (
    <main className='pt-8'>
      {params.chatId}
    </main>
  );
};

export default page;