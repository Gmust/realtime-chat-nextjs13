'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { chatHrefConstructor, toPusherKey } from '@/lib/Utils';
import { pusherClient } from '@/lib/pusher';
import toast from 'react-hot-toast';
import { UnseenChatToast } from '@/components/UnseenChatToast';

interface SidebarChatList {
  friends: User[];
  sessionId: string;
}

interface ExtendedMessage extends Message {
  senderImage: string,
  senderName: string
}

export const SidebarChatList = ({ friends, sessionId }: SidebarChatList) => {

  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify = pathname !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;
      if (!shouldNotify) return;
      console.log('here');
      toast.custom((t) => (
        <UnseenChatToast t={t} sessionId={sessionId} senderId={message.senderId} senderImg={message.senderImage}
                         senderName={message.senderName} senderMessage={message.text} />
      ));
      setUnseenMessages((prev) => [...prev, message]);
    };

    const newFriendHandler = () => {
      router.refresh();
    };

    pusherClient.bind('new_message', chatHandler);
    pusherClient.bind('new_friend', newFriendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
    };

  }, [pathname, sessionId, router]);

  useEffect(() => {
    if (pathname?.includes('chat')) {
      setUnseenMessages((prev) => {
        return prev?.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);

  return (
    <ul role='link' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
      {
        friends.sort().map((friend) => {
          const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
            return unseenMsg.senderId === friend.id;
          }).length;

          return (
            <li key={friend.id} className='flex'>
              <a href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}
                 className='text-gray-700 hover:text-violet-600 hover:bg-gray-50 group flex items-center gap-y-3
                  rounded-md p-2 text-base leading-6 font-semibold'>
                {friend.name}
                {unseenMessagesCount! > 0 ?
                  <div className='bg-violet-600 font-medium text-sm text-white w-4 h-4 rounded-full flex justify-center
                                 items-center p-2 ml-1'>
                    {unseenMessagesCount}
                  </div>
                  : null}
              </a>
            </li>
          );
        })
      }
    </ul>
  );
};

