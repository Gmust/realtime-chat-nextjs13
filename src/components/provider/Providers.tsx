import { Toaster } from 'react-hot-toast';

interface ProviderProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProviderProps) => {
  return (
    <>
      <Toaster position='top-center' reverseOrder={false} />
      {children}
    </>
  );
};

