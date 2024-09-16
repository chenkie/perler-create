import Anthropic from "@anthropic-ai/sdk";
import type { APIRoute } from "astro";

const getPrompt = (imageTerm: string) => {
  return `Perler boards are generally 29 x 29 spaces.

I have this data schema to represent positions and colors:


type BoardMark = {
  x: number;
  y: number;
  color: string; // hex code
}

type BoardMarks = BoardMark[];


Please produce an image for the following term: ${imageTerm} and return the BoardMarks array to fill the board.

For the returned response, please start at the beginning of the array and at the end of the array. No need for any text or other content. Please do not create new lines in the response. All data should be on a single line. All key names should be in quotes.`;
};

const anthropic = new Anthropic({
  apiKey: import.meta.env.CLAUDE_API_KEY,
});

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams);

  const msg = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 5000,
    messages: [{ role: "user", content: getPrompt(queryParams.imageTerm) }],
  });

  // @ts-ignore
  const boardMarks = JSON.parse(msg.content[0].text);
  return new Response(JSON.stringify(boardMarks));
};
