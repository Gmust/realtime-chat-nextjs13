'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { useState } from 'react';

interface FriendRequestsSidebarOption {
  initialUnseenRequestCount: number;
  sessionId: string;
}

export const FriendRequestsSidebarOption = ({ initialUnseenRequestCount, sessionId }: FriendRequestsSidebarOption) => {

  const [unseenRequestsCount, setUnseenRequestsCount] = useState<number>(initialUnseenRequestCount);

  return (
    <Link href='/dashboard/requests'
          className='text-gray-700 hover:text-violet-700 hover:bg-gray-50 group flex
                    items-center gap-x-3 rounded-md p-2 text-base leading-6 font-semibold'>
      <div className='text-gray-400 border-gray-200 group-hover:border-violet-700 group-hover:text-violet-700 flex h-6 w-6
                      shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
        <User className='h-4 w-4' />
      </div>
      <p className='truncate'>Friend requests</p>
      {unseenRequestsCount > 0 &&
        <div className='rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-violet-700'>
          {initialUnseenRequestCount}
        </div>
      }
    </Link>
  );
};

