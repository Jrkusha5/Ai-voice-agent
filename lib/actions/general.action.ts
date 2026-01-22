"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { prisma } from "@/lib/db";
import { feedbackSchema } from "@/constants";

const mockInterviews: Interview[] = [
  {
    id: "mock-1",
    userId: "mock-uid",
    role: "Frontend Engineer",
    type: "Technical",
    techstack: "React, Tailwind, Next.js",
    createdAt: new Date().toISOString(),
    finalized: true,
  },
  {
    id: "mock-2",
    userId: "mock-uid",
    role: "Fullstack Developer",
    type: "Mixed",
    techstack: "Node.js, PostgreSQL",
    createdAt: new Date().toISOString(),
    finalized: true,
  },
];

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    // Get attempt if feedbackId is provided (feedbackId is actually attemptId)
    let attemptId = feedbackId || null;
    
    // Verify attempt exists and belongs to user
    if (attemptId) {
      const attempt = await prisma.interviewAttempt.findUnique({
        where: { id: attemptId },
      });
      if (!attempt || attempt.userId !== userId) {
        attemptId = null;
      }
    }

    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a quiz-based interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        
        Interview Transcript (Questions and Answers):
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a quiz-based interview. Your task is to evaluate the candidate based on structured categories",
    });

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        interviewId: interviewId,
        userId: userId,
        attemptId: attemptId,
        totalScore: object.totalScore,
        categoryScores: object.categoryScores as any,
        strengths: object.strengths,
        areasForImprovement: object.areasForImprovement,
        finalAssessment: object.finalAssessment,
      },
    });

    return { success: true, feedbackId: feedback.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        questionsList: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!interview) return null;

    // Convert to Interview interface format
    return {
      id: interview.id,
      role: interview.role,
      level: interview.level,
      questions: interview.questions, // Legacy field
      techstack: interview.techstack,
      createdAt: interview.createdAt.toISOString(),
      userId: "", // Not used in current interface
      type: interview.type,
      finalized: interview.finalized,
    };
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  try {
    const feedback = await prisma.feedback.findFirst({
      where: {
        interviewId,
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!feedback) return null;

    return {
      id: feedback.id,
      interviewId: feedback.interviewId,
      totalScore: feedback.totalScore,
      categoryScores: feedback.categoryScores as any,
      strengths: feedback.strengths,
      areasForImprovement: feedback.areasForImprovement,
      finalAssessment: feedback.finalAssessment,
      createdAt: feedback.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return null;
  }
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  try {
    const interviews = await prisma.interview.findMany({
      where: {
        finalized: true,
        // Exclude user's own interviews if needed
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return interviews.map((interview) => ({
      id: interview.id,
      role: interview.role,
      level: interview.level,
      questions: interview.questions,
      techstack: interview.techstack,
      createdAt: interview.createdAt.toISOString(),
      userId: "",
      type: interview.type,
      finalized: interview.finalized,
    }));
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return [];
  }
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  try {
    // Get interviews from attempts
    const attempts = await prisma.interviewAttempt.findMany({
      where: {
        userId,
        status: "completed",
      },
      include: {
        interview: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      distinct: ["interviewId"],
    });

    return attempts.map((attempt) => ({
      id: attempt.interview.id,
      role: attempt.interview.role,
      level: attempt.interview.level,
      questions: attempt.interview.questions,
      techstack: attempt.interview.techstack,
      createdAt: attempt.interview.createdAt.toISOString(),
      userId: userId,
      type: attempt.interview.type,
      finalized: attempt.interview.finalized,
    }));
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    return [];
  }
}
