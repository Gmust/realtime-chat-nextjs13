import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { addFriendValidator } from '@/lib/validations/add-friend';
import { authOptions } from '@/lib/auth';
import { fetchRedis } from '@/helpers/redis';
import { db } from '@/lib/db';
import { pusherServer } from '@/lib/pusher';
import { toPusherKey } from '@/lib/Utils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email: emailToAdd } = addFriendValidator.parse(body.email);
    const RESTResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email:${emailToAdd}`, {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
      },
      cache: 'no-store'
    });

    const data = await RESTResponse.json() as { result: string | null };
    const idToAdd = data.result;

    if (!idToAdd) {
      return new Response('This person does not exist.', { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (idToAdd === session.user.id) {
      return new Response('You cannot add yourself as friend.', { status: 400 });
    }

    // check if user already added
    const isAlreadyAdded =
      await fetchRedis('sismember', `user:${idToAdd}:incoming_friend_requests`, session.user.id);

    if (isAlreadyAdded) {
      return new Response('This user is already added.', { status: 400 });
    }

    const isAlreadyFriends =
      await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd);

    if (isAlreadyFriends) {
      return new Response('This user is your friend.', { status: 400 });
    }

    await pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
      'incoming_friend_requests',
      {
        senderId: session.user.id,
        senderEmail: session.user.email,
        senderImage: session.user.image
      }
    );

    await db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return new Response('OK');
  } catch (e) {
    if (e instanceof z.ZodError) {
      return new Response('Invalid request payload.', { status: 422 });
    }

    return new Response('Invalid request', { status: 400 });
  }
}