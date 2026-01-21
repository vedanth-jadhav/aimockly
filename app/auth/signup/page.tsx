import { AuthForm } from "@/components/auth/AuthForm";
import Link from "next/link";
import { MockyAvatar } from "@/components/mocky/MockyAvatar";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="container mx-auto px-4 py-6">
        <Link href="/" className="flex items-center gap-2">
          <MockyAvatar expression="default" size="sm" animate={false} />
          <span className="text-xl font-bold text-gray-800">Mockly</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <AuthForm />
      </div>
    </div>
  );
}
