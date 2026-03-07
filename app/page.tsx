import LoginForm from '@/components/ui/LoginForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#36393f] flex items-center justify-center">
      <div className="bg-[#36393f] p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-white text-3xl font-bold mb-6 text-center">Discord Login</h1>
        <LoginForm />
      </div>
    </div>
  );
}
