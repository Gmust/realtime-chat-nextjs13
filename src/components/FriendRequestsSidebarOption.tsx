'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher';
import { toPusherKey } from '@/lib/Utils';
import { useRouter } from 'next/navigation';

interface FriendRequestsSidebarOption {
  initialUnseenRequestCount: number;
  sessionId: string;
}

export const FriendRequestsSidebarOption = ({ initialUnseenRequestCount, sessionId }: FriendRequestsSidebarOption) => {

  const [unseenRequestsCount, setUnseenRequestsCount] = useState<number>(initialUnseenRequestCount);
  const router = useRouter();

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );

    const friendRequestHandler = () => {
      setUnseenRequestsCount((prev) => prev + 1);
      router.refresh();
    };

    pusherClient.bind('incoming_friend_requests', friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler);
    };
  }, []);

  return (
    <Link href='/dashboard/requests'
          className='text-gray-700 hover:text-violet-700 hover:bg-gray-50 group flex
                    items-center gap-x-3 rounded-md p-2 text-base leading-6 font-semibold'>
      <div className='text-gray-400 border-gray-200 group-hover:border-violet-700 group-hover:text-violet-700 flex h-6 w-6
                      shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
        <User className='h-4 w-4' />
      </div>
      <p className='truncate'>Friend requests</p>
      {unseenRequestsCount > 0 ?
        <div className='rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-violet-700'>
          {initialUnseenRequestCount}
        </div>
        : null
      }
    </Link>
  );
};

