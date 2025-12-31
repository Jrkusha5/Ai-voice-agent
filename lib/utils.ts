import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRandomInterviewCover() {
  const covers = [
    "adobe.png",
    "amazon.png",
    "facebook.png",
    "hostinger.png",
    "pinterest.png",
    "quora.png",
    "reddit.png",
    "skype.png",
    "spotify.png",
    "telegram.png",
    "tiktok.png",
    "yahoo.png",
  ];

  const randomIndex = Math.floor(Math.random() * covers.length);
  return `/covers/${covers[randomIndex]}`;
}

export const getTechLogos = async (techStack: string) => {
  if (!techStack) return [];

  const tags = techStack.split(",");

  return tags.map((tag) => {
    const t = tag.trim();
    const key = t.toLowerCase();

    let url = "/tech.svg";
    if (key.includes("react")) url = "/react.svg";
    else if (key.includes("next")) url = "/next.svg";
    else if (key.includes("tailwind")) url = "/tailwind.svg";
    else if (key.includes("vercel")) url = "/vercel.svg";

    return { tech: t, url };
  });
};
