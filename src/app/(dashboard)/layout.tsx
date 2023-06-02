import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Icon, Icons } from '@/components/Icons/Icons';
import Image from 'next/image';

interface LayoutProps {
  children: React.ReactNode;
}

interface SidebarOption {
  id: number,
  name: string,
  href: string
  Icon: Icon,
}

const sidebarOptions: SidebarOption[] = [
  {
    id: 1,
    name: 'Add friend',
    href: '/dashboard/add',
    Icon: 'UserPlus'
  }
];

const Layout = async ({ children }: LayoutProps) => {

  const session = await getServerSession();
  if (!session) notFound();

  return (
    <div className='w-full h-screen flex'>
      <div
        className='flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6'>
        <Link href='/dashboard' className='flex h-16 shrink-0 items-center'>
          <Icons.Twitter className='h-10 w-auto text-violet-600' />
        </Link>

        <div className='text-base font-semibold leading-6 text-gray-400'>
          Your chats
        </div>

        <nav className='flex flex-1 flex-col'>
          <ul role='link' className='flex flex-1 flex-col gap-y-7'>
            <li>
              // chats that user has
            </li>
            <li>
              <div className='text-base font-semibold leading-6 text-gray-400'>
                Overview
              </div>
              <ul role='list' className='-mx-2 mt-2 space-y-1'>
                {sidebarOptions.map(item => {

                  const Icon = Icons[item.Icon];

                  return (
                    <li key={item.id}>
                      <Link href={item.href}
                            className='group  text-gray-700 hover:text-violet-700-600 hover:bg-gray-50  flex gap-3
                             rounded-md p-2 text-base leading-6 font-semibold'
                      >
                        <span
                          className='text-gray-400 border-gray-200 group-hover:border-violet-700 group-hover:text-violet-700 flex
                                     h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
                            <Icon className='h-4 w-4' />
                        </span>
                        <span
                          className='truncate group-hover:border-violet-700 group-hover:text-violet-700'>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li className='-mx-6 mt-auto flex items-center'>
              <div
                className='flex flex-1 items-center gap-x-4 px-6 py-3 text-base font-semibold leading-6 text-gray-400'>
                <div className='relative h-8 w-8 bg-gray-50'>
                  <Image fill
                         referrerPolicy='no-referrer'
                         className='rounded-full'
                         src={session.user.image || ''}
                         alt='Your profile picture' />
                </div>
                <span className='sr-only'>Your profile</span>
                <div className='flex flex-col'>
                  <span aria-hidden={true}>
                    {session.user.name}
                  </span>
                  <span className='text-base text-zinc-400' aria-hidden={true}>
                    {session.user.email}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>
      {children}
    </div>
  );
};

export default Layout;