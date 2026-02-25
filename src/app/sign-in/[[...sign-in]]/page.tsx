'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-lf-bg relative overflow-hidden p-6">
            {/* Background Ornaments */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-lf-accent/5 blur-[160px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lf-accent/10 blur-[140px] rounded-full" />

            <div className="relative z-10 w-full flex flex-col items-center">
                <div className="mb-10 text-center space-y-3">
                    <h1 className="lf-title lf-text text-5xl tracking-tighter">LinkedFlow</h1>
                    <p className="lf-body text-lf-text3">The Intelligence Layer for LinkedIn Power Users.</p>
                </div>

                <div className="bg-lf-s1 p-2 rounded-lg border border-lf-border shadow-2xl shadow-black">
                    <SignIn appearance={{
                        elements: {
                            card: "bg-transparent shadow-none border-none",
                            headerTitle: "lf-title lf-text text-2xl",
                            headerSubtitle: "lf-body text-lf-text3",
                            formButtonPrimary: "bg-lf-accent hover:bg-lf-accent2 text-white lf-subtitle font-bold rounded-lg border-none",
                            socialButtonsBlockButton: "bg-lf-s2 border-lf-border hover:bg-lf-s3 text-lf-text lf-body-sm rounded-lg",
                            socialButtonsBlockButtonText: "lf-body-sm font-bold",
                            formFieldLabel: "lf-label text-lf-text4 font-bold uppercase",
                            formFieldInput: "bg-lf-s2 border-lf-border text-lf-text lf-body-sm rounded-lg h-11",
                            footerActionLink: "text-lf-accent hover:text-lf-accent2 lf-body-sm font-bold"
                        }
                    }} />
                </div>
            </div>
        </div>
    )
}
