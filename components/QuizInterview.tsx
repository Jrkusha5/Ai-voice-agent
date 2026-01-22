"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "./QuestionCard";
import { Button } from "@/components/ui/button";
import {
  createInterviewAttempt,
  getInterviewQuestions,
  submitAnswer,
  updateAttemptProgress,
  completeInterviewAttempt,
} from "@/lib/actions/quiz.action";
import { createFeedback } from "@/lib/actions/general.action";

interface QuizInterviewProps {
  interviewId: string;
  userId: string;
  userName: string;
}

const QuizInterview = ({
  interviewId,
  userId,
  userName,
}: QuizInterviewProps) => {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [answers, setAnswers] = useState<Array<{ questionId: string; answer: string; timeSpent: number }>>([]);

  useEffect(() => {
    const initializeInterview = async () => {
      try {
        // Create attempt
        const attemptResult = await createInterviewAttempt({
          interviewId,
          userId,
        });

        if (!attemptResult.success || !attemptResult.attemptId) {
          console.error("Failed to create attempt");
          router.push("/");
          return;
        }

        setAttemptId(attemptResult.attemptId);

        // Fetch questions
        const questionsList = await getInterviewQuestions(interviewId);
        setQuestions(questionsList);
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing interview:", error);
        router.push("/");
      }
    };

    initializeInterview();
  }, [interviewId, userId, router]);

  const handleAnswerSubmit = async (answer: string, timeSpent: number) => {
    if (!attemptId || isSubmitting) return;

    setIsSubmitting(true);
    const currentQuestion = questions[currentQuestionIndex];

    try {
      // Submit answer
      const result = await submitAnswer({
        attemptId,
        questionId: currentQuestion.id,
        userAnswer: answer,
        timeSpent,
      });

      if (result.success) {
        // Store answer locally
        setAnswers((prev) => [
          ...prev,
          {
            questionId: currentQuestion.id,
            answer,
            timeSpent,
          },
        ]);

        // Update progress
        await updateAttemptProgress({
          attemptId,
          currentQuestionIndex: currentQuestionIndex + 1,
        });

        // Move to next question or complete
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setIsSubmitting(false);
        } else {
          // Complete interview
          await completeInterview();
        }
      } else {
        console.error("Failed to submit answer");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setIsSubmitting(false);
    }
  };

  const completeInterview = async () => {
    if (!attemptId) return;

    try {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);

      // Complete attempt
      const result = await completeInterviewAttempt({
        attemptId,
        totalTime,
      });

      if (result.success) {
        // Generate feedback from answers
        const transcript = answers.map((ans, idx) => {
          const question = questions.find((q) => q.id === ans.questionId);
          return {
            role: "assistant",
            content: question?.question || `Question ${idx + 1}`,
          };
        }).concat(
          answers.map((ans) => ({
            role: "user",
            content: ans.answer,
          }))
        );

        // Create feedback
        const feedbackResult = await createFeedback({
          interviewId,
          userId,
          transcript,
          feedbackId: attemptId, // Pass attemptId so feedback can be linked
        });

        if (feedbackResult.success) {
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          router.push(`/interview/${interviewId}/feedback`);
        }
      } else {
        console.error("Failed to complete interview");
        router.push("/");
      }
    } catch (error) {
      console.error("Error completing interview:", error);
      router.push("/");
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      handleAnswerSubmit("", 0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-200 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl mb-4">No questions available for this interview.</p>
          <Button onClick={() => router.push("/")} className="btn-primary">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Interview in Progress</h2>
            <div className="text-sm text-gray-400">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-dark-200 rounded-full h-2">
            <div
              className="bg-primary-200 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onSubmit={handleAnswerSubmit}
          timeLimit={300} // 5 minutes per question
        />

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            onClick={handleSkip}
            disabled={isSubmitting || currentQuestionIndex === 0}
            className="btn-secondary"
          >
            Skip Question
          </Button>
          
          <div className="text-sm text-gray-400">
            Time elapsed: {Math.floor((Date.now() - startTime) / 1000)}s
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInterview;

