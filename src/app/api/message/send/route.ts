import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchRedis } from '@/helpers/redis';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';
import { messageValidator } from '@/lib/validations/message';
import { pusherServer } from '@/lib/pusher';
import { toPusherKey } from '@/lib/Utils';

export async function POST(req: NextRequest) {
  try {
    const { text, chatId } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const [userId1, userId2] = chatId.split('--');

    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return new Response('Unauthorized', { status: 401 });
    }

    const friendId = session.user.id === userId1 ? userId2 : userId1;
    const friendList = await fetchRedis('smembers', `user:${session.user.id}:friends`) as string[];
    const isFriend = friendList.includes(friendId);

    if (!isFriend) {
      return new Response('Unauthorized', { status: 401 });
    }

    const rawSender = (await fetchRedis(
      'get',
      `user:${session.user.id}`
    )) as string;
    const sender = JSON.parse(rawSender) as User;

    const timestamp = Date.now();

    const messageData = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp
    };

    const message = messageValidator.parse(messageData);

    await pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'incoming-message', message);
    await pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
      ...message,
      senderImage: sender.image,
      senderName: sender.name
    });

    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message)
    });

    return new Response('OK');
  } catch (e) {
    if (e instanceof Error) {
      return new Response(e.message, { status: 500 });
    }

    return new Response('Internal server error', { status: 500 });
  }
}