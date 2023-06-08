'use client';

import { useEffect, useState } from 'react';
import { Check, Frown, UserPlus, X } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { pusherClient } from '@/lib/pusher';
import { toPusherKey } from '@/lib/Utils';

interface FriendRequests {
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
}

export const FriendRequests = ({ incomingFriendRequests, sessionId }: FriendRequests) => {

  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(incomingFriendRequests);
  const router = useRouter();

  const acceptFriend = async (senderId: string) => {
    await axios.post('/api/friends/accept', { id: senderId });
    setFriendRequests((prev) => prev.filter((req) => req.senderId !== senderId));
    router.refresh();
  };

  const denyFriend = async (senderId: string) => {
    await axios.post('/api/friends/deny', { id: senderId });
    setFriendRequests((prev) => prev.filter((req) => req.senderId !== senderId));
    router.refresh();
  };


  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );

    const friendRequestHandler = ({ senderId, senderEmail, senderImage }: IncomingFriendRequest) => {
      // @ts-ignore
      setFriendRequests((prev) => [...prev, { senderId, senderEmail, senderImage }]);
    };

    pusherClient.bind('incoming_friend_requests', friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler);
    };
  }, [sessionId]);

  return (
    <>
      {
        friendRequests.length === 0
          ? <p className='text-base text-zinc-500 flex'>Nothing to show here... <Frown className='ml-2' /></p>
          :
          friendRequests.map((request) => {
              return (
                <div key={request.senderId} className='flex gap-4 items-center'>
                  <UserPlus className='text-black' />
                  <Image src={request.senderImage} alt='user image' width={30} height={30} className='rounded-md' />
                  <p className='font-medium text-lg'>{request.senderEmail}</p>
                  <button className='w-8 h-8 bg-violet-600 hover:bg-violet-700 grid place-items-center rounded-full
                                 transition hover:shadow-md' aria-label='accept friend'
                          onClick={() => acceptFriend(request.senderId)}>
                    <Check className='font-semibold text-white w-3/4 h-3/4' />
                  </button>
                  <button className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full
                                 transition hover:shadow-md' aria-label='denu friend'
                          onClick={() => denyFriend(request.senderId)}>
                    <X className='font-semibold text-white w-3/4 h-3/4'
                    />
                  </button>
                </div>);
            }
          )
      }
    </>
  );
};

