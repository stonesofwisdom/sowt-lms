export async function ai({ system, messages, max_tokens = 1000 }) {
  try {
    const res = await fetch("/.netlify/functions/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, messages, max_tokens }),
    });
    const data = await res.json();
    return data.text || "";
  } catch (e) {
    return "Couldn't reach the AI just now. Please try again.";
  }
}
export function feedbackPrompt(title, prompt, text) {
  return {
    system: "You are a warm, expert teaching coach in Stones of Wisdom Tutors' 'Get Paid to Teach Online' Masterclass. Give short, encouraging formative feedback: 2 specific strengths, 2 things to sharpen, and 1 next step. A lightly Nigerian mentor tone is welcome. Under 180 words.",
    messages: [{ role: "user", content: `Assignment: ${title}\nTask: ${prompt}\n\nSubmission:\n${text}` }],
  };
}
