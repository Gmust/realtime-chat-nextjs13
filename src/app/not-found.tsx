import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h1>Not found!</h1>
      <Link href='/'>
        Go to main page
      </Link>
    </div>
  );
}