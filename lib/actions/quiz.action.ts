"use server";

import { prisma } from "@/lib/db";

export async function createInterviewAttempt(params: {
  interviewId: string;
  userId: string;
}) {
  try {
    const attempt = await prisma.interviewAttempt.create({
      data: {
        interviewId: params.interviewId,
        userId: params.userId,
        status: "in-progress",
      },
    });

    return { success: true, attemptId: attempt.id };
  } catch (error) {
    console.error("Error creating interview attempt:", error);
    return { success: false, error: "Failed to start interview" };
  }
}

export async function getInterviewAttempt(attemptId: string) {
  try {
    const attempt = await prisma.interviewAttempt.findUnique({
      where: { id: attemptId },
      include: {
        interview: {
          include: {
            questionsList: {
              orderBy: { order: "asc" },
            },
          },
        },
        answers: true,
      },
    });

    return attempt;
  } catch (error) {
    console.error("Error fetching attempt:", error);
    return null;
  }
}

export async function getInterviewQuestions(interviewId: string) {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        questionsList: {
          orderBy: { order: "asc" },
        },
      },
    });

    return interview?.questionsList || [];
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
}

export async function submitAnswer(params: {
  attemptId: string;
  questionId: string;
  userAnswer: string;
  timeSpent: number;
}) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: params.questionId },
    });

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    // Check if answer is correct (for quiz questions)
    let isCorrect: boolean | null = null;
    let score = 0;

    if (question.type === "multiple-choice" && question.correctAnswer) {
      isCorrect = params.userAnswer.trim().toLowerCase() === 
                  question.correctAnswer.trim().toLowerCase();
      score = isCorrect ? question.points : 0;
    }

    // Create answer record
    const answer = await prisma.answer.create({
      data: {
        questionId: params.questionId,
        attemptId: params.attemptId,
        userAnswer: params.userAnswer,
        isCorrect,
        score,
        timeSpent: params.timeSpent,
      },
    });

    return { success: true, answer, isCorrect, score };
  } catch (error) {
    console.error("Error submitting answer:", error);
    return { success: false, error: "Failed to submit answer" };
  }
}

export async function updateAttemptProgress(params: {
  attemptId: string;
  currentQuestionIndex: number;
  totalTime?: number;
}) {
  try {
    await prisma.interviewAttempt.update({
      where: { id: params.attemptId },
      data: {
        currentQuestionIndex: params.currentQuestionIndex,
        totalTime: params.totalTime,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating attempt progress:", error);
    return { success: false };
  }
}

export async function completeInterviewAttempt(params: {
  attemptId: string;
  totalTime: number;
}) {
  try {
    // Calculate total score
    const attempt = await prisma.interviewAttempt.findUnique({
      where: { id: params.attemptId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!attempt) {
      return { success: false, error: "Attempt not found" };
    }

    const totalScore = attempt.answers.reduce((sum, answer) => {
      return sum + (answer.score || 0);
    }, 0);

    const maxPossibleScore = attempt.answers.reduce((sum, answer) => {
      return sum + (answer.question.points || 1);
    }, 0);

    const percentageScore = maxPossibleScore > 0 
      ? Math.round((totalScore / maxPossibleScore) * 100)
      : 0;

    // Update attempt
    const updatedAttempt = await prisma.interviewAttempt.update({
      where: { id: params.attemptId },
      data: {
        status: "completed",
        quizScore: percentageScore,
        totalTime: params.totalTime,
        completedAt: new Date(),
      },
    });

    return { 
      success: true, 
      attempt: updatedAttempt,
      totalScore,
      maxPossibleScore,
      percentageScore,
    };
  } catch (error) {
    console.error("Error completing attempt:", error);
    return { success: false, error: "Failed to complete interview" };
  }
}


