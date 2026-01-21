"use server";

import bcrypt from "bcryptjs";
import { signIn as nextAuthSignIn, auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function signUp(params: SignUpParams) {
  const { name, email, password } = params;

  try {
    // Validate input
    if (!name || !email || !password) {
      return {
        success: false,
        message: "All fields are required.",
      };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);
    
    // Provide more specific error messages
    if (error?.code === 'P2002') {
      return {
        success: false,
        message: "Email already exists. Please sign in.",
      };
    }
    
    if (error?.code === 'P1001') {
      return {
        success: false,
        message: "Cannot connect to database. Please check your connection.",
      };
    }

    // Log full error for debugging
    console.error("Full error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    });

    return {
      success: false,
      message: error?.message || "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, password } = params;

  try {
    const result = await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    return {
      success: true,
      message: "Signed in successfully.",
    };
  } catch (error: any) {
    console.error("Error signing in:", error);

    return {
      success: false,
      message: "Failed to sign in. Please try again.",
    };
  }
}

export async function getCurrentUser() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return null;
    }

    // Fetch user with role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { role: true }
    });

    return {
      id: session.user.id as string,
      name: session.user.name as string,
      email: session.user.email as string,
      profileURL: session.user.image || undefined,
      role: user?.role || "USER",
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function isAdmin() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return false;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { role: true }
    });
    
    return user?.role === "ADMIN";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function isAuthenticated() {
  try {
    const session = await auth();
    return !!session?.user;
  } catch (error) {
    return false;
  }
}
