"use server";

import { prisma } from "@/lib/db";

export async function createInterview(params: {
  role: string;
  level: string;
  type: string;
  techstack: string[];
  description?: string;
  questions: Array<{
    type: string;
    question: string;
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
    points?: number;
  }>;
}) {
  try {
    const interview = await prisma.interview.create({
      data: {
        role: params.role,
        level: params.level,
        type: params.type,
        techstack: params.techstack,
        description: params.description,
        finalized: true,
        questionsList: {
          create: params.questions.map((q, index) => ({
            type: q.type,
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points || 1,
            order: index,
          })),
        },
      },
      include: {
        questionsList: true,
      },
    });

    return { success: true, interview };
  } catch (error) {
    console.error("Error creating interview:", error);
    return { success: false, error: "Failed to create interview" };
  }
}

// Helper function to create sample interviews for testing
export async function createSampleInterviews() {
  const sampleInterviews = [
    {
      role: "Frontend Engineer",
      level: "Junior",
      type: "Technical",
      techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
      description: "A technical interview for frontend developers",
      questions: [
        {
          type: "multiple-choice",
          question: "What is React?",
          options: [
            "A JavaScript library for building user interfaces",
            "A database management system",
            "A CSS framework",
            "A programming language",
          ],
          correctAnswer: "A JavaScript library for building user interfaces",
          explanation: "React is a JavaScript library developed by Facebook for building user interfaces, particularly web applications.",
          points: 5,
        },
        {
          type: "multiple-choice",
          question: "What is JSX?",
          options: [
            "A JavaScript extension that allows writing HTML-like syntax",
            "A CSS preprocessor",
            "A database query language",
            "A testing framework",
          ],
          correctAnswer: "A JavaScript extension that allows writing HTML-like syntax",
          explanation: "JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.",
          points: 5,
        },
        {
          type: "text",
          question: "Explain the concept of virtual DOM in React.",
          points: 10,
        },
        {
          type: "multiple-choice",
          question: "What is the purpose of useEffect hook?",
          options: [
            "To manage component state",
            "To perform side effects in functional components",
            "To create new components",
            "To handle form submissions",
          ],
          correctAnswer: "To perform side effects in functional components",
          explanation: "useEffect is used to perform side effects like data fetching, subscriptions, or manually changing the DOM in functional components.",
          points: 5,
        },
      ],
    },
    {
      role: "Full Stack Developer",
      level: "Mid",
      type: "Mixed",
      techstack: ["Node.js", "Express", "PostgreSQL", "React"],
      description: "A mixed interview covering both frontend and backend",
      questions: [
        {
          type: "multiple-choice",
          question: "What is Node.js?",
          options: [
            "A JavaScript runtime built on Chrome's V8 engine",
            "A frontend framework",
            "A database",
            "A CSS framework",
          ],
          correctAnswer: "A JavaScript runtime built on Chrome's V8 engine",
          explanation: "Node.js is a JavaScript runtime that allows you to run JavaScript on the server side.",
          points: 5,
        },
        {
          type: "text",
          question: "Explain the difference between SQL and NoSQL databases.",
          points: 10,
        },
        {
          type: "multiple-choice",
          question: "What is REST API?",
          options: [
            "A database management system",
            "An architectural style for designing networked applications",
            "A programming language",
            "A CSS framework",
          ],
          correctAnswer: "An architectural style for designing networked applications",
          explanation: "REST (Representational State Transfer) is an architectural style for designing networked applications using HTTP methods.",
          points: 5,
        },
      ],
    },
  ];

  const results = [];
  for (const interview of sampleInterviews) {
    const result = await createInterview(interview);
    results.push(result);
  }

  return results;
}


