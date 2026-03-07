import LoginForm from '@/components/ui/LoginForm';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-[#36393f] p-8 rounded-xl w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome back!</h1>
        <p className="text-gray-400 text-center mb-8">We're so excited to see you again!</p>
        <LoginForm />
      </div>
    </div>
  );
}
