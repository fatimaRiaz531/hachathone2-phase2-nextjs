import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <SignIn appearance={{
                elements: {
                    rootBox: "mx-auto",
                    card: "bg-zinc-900 border border-zinc-800 text-white",
                    headerTitle: "text-white text-2xl font-bold",
                    headerSubtitle: "text-zinc-400",
                    socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700",
                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest",
                    footerActionLink: "text-primary hover:text-primary/80",
                    formFieldLabel: "text-zinc-300",
                    formFieldInput: "bg-zinc-800 border-zinc-700 text-white",
                    dividerLine: "bg-zinc-800",
                    dividerText: "text-zinc-500"
                }
            }} />
        </div>
    );
}
