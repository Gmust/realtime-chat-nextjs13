import { AddFriendButton } from '@/components/AddFriendButton';

const page = () => {
  return (
    <section className='pt-8'>
      <h1 className='text-5xl font-bold mb-8'>Add your friend!</h1>
      <AddFriendButton />
    </section>
  );
};

export default page;