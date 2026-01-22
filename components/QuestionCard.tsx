"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Timer from "./Timer";

interface QuestionCardProps {
  question: {
    id: string;
    type: string;
    question: string;
    options?: string[];
    points: number;
    explanation?: string;
  };
  questionNumber: number;
  totalQuestions: number;
  onSubmit: (answer: string, timeSpent: number) => void;
  timeLimit?: number; // in seconds
  onTimeUp?: () => void;
}

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  onSubmit,
  timeLimit,
  onTimeUp,
}: QuestionCardProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [startTime] = useState<number>(Date.now());
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (isSubmitted) return;
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const answer = question.type === "multiple-choice" 
      ? selectedAnswer 
      : textAnswer.trim();
    
    if (!answer && question.type === "multiple-choice") {
      return; // Don't submit if no answer selected
    }
    
    setIsSubmitted(true);
    onSubmit(answer, timeSpent);
  };

  const handleTimeUp = () => {
    if (!isSubmitted) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const answer = question.type === "multiple-choice" 
        ? selectedAnswer 
        : textAnswer.trim();
      
      setIsSubmitted(true);
      onSubmit(answer || "", timeSpent);
      
      if (onTimeUp) {
        onTimeUp();
      }
    }
  };

  return (
    <div className="card-border p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-400">
          Question {questionNumber} of {totalQuestions}
        </div>
        <div className="text-sm font-semibold text-primary-200">
          {question.points} {question.points === 1 ? "point" : "points"}
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-6">{question.question}</h3>

      {question.type === "multiple-choice" && question.options ? (
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !isSubmitted && setSelectedAnswer(option)}
              disabled={isSubmitted}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswer === option
                  ? "border-primary-200 bg-primary-100/20"
                  : "border-dark-200 hover:border-primary-200/50"
              } ${isSubmitted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === option
                      ? "border-primary-200 bg-primary-200"
                      : "border-gray-400"
                  }`}
                >
                  {selectedAnswer === option && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="mb-6">
          <textarea
            value={textAnswer}
            onChange={(e) => !isSubmitted && setTextAnswer(e.target.value)}
            disabled={isSubmitted}
            placeholder="Type your answer here..."
            className="w-full min-h-[200px] p-4 rounded-lg border-2 border-dark-200 bg-dark-100 text-white placeholder-gray-500 focus:border-primary-200 focus:outline-none resize-none disabled:opacity-60"
          />
        </div>
      )}

      {timeLimit && (
        <div className="mb-4">
          <Timer
            initialSeconds={timeLimit}
            onTimeUp={handleTimeUp}
            className="justify-end"
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitted || (question.type === "multiple-choice" && !selectedAnswer)}
          className="btn-primary"
        >
          {isSubmitted ? "Submitted" : "Submit Answer"}
        </Button>
      </div>
    </div>
  );
};

export default QuestionCard;

