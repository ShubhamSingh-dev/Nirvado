import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaGoogle } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa6";
import { signIn } from "@/auth";

async function handleGoogleSignIn() {
  "use server";
  await signIn("google");
}

async function handleGithubSignIn() {
  "use server";
  await signIn("github");
}

const SignInFormClient = () => {
  return (
    <div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign In
          </CardTitle>
          <CardDescription className="text-center">
            Choose your Prefered Sign-in Method
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form action={handleGoogleSignIn}>
            <Button type="submit" variant={"outline"} className="w-full">
              <FaGoogle className="mr-2 h-4 w-4" />
              <span>Sign in with Google</span>
            </Button>
          </form>
          <form action={handleGithubSignIn}>
            <Button type="submit" variant={"outline"} className="w-full">
              <FaGithub className="mr-2 h-4 w-4" />
              <span>Sign in with Github</span>
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-sm text-center text-gray-500 dark:text-gray-400 w-full">
          By signing in you agree to our{" "}
          <a href="#" className="underline hover:text-primary">
            Terms of Service
          </a>
          ,{" "}
          <a href="#" className="underline hover:text-primary">
            Privacy Policy
          </a>
          , and{" "}
          <a href="#" className="underline hover:text-primary">
            Cookie Policy
          </a>
          .
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignInFormClient;
