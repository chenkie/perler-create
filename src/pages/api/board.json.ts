import type { APIRoute } from "astro";

import OpenAI from "openai";

const openai = new OpenAI({
  organization: import.meta.env.OPENAI_ORGANIZATION,
  project: import.meta.env.OPENAI_PROJECT,
  apiKey: import.meta.env.OPENAI_API_KEY,
});

const getPrompt = (imageTerm: string) => {
  return `Perler boards are generally 29 x 29 spaces.

I have this data schema to represent positions and colors:


type BoardMark = {
  x: number;
  y: number;
  c: string; // hex code
}

type BoardMarks = BoardMark[];


Please produce an image for the following term: ${imageTerm} and return the BoardMarks array to fill the board.

There should be no gaps between the beads. Each bead should be touching another bead.

Limit the total number of beads to 100.

For the returned response, please start at the beginning of the array and at the end of the array. No need for any text or other content. Please do not create new lines in the response. All data should be on a single line. All key names should be in quotes.`;
};

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams);

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a Perler bead pattern generator." },
      { role: "user", content: getPrompt(queryParams.imageTerm) },
    ],
    model: "gpt-4o",
  });

  if (!completion.choices[0].message.content) {
    return new Response(
      JSON.stringify({
        error: "No content",
      }),
      {
        status: 400,
      }
    );
  }

  const boardMarks = completion.choices[0].message.content;
  return new Response(boardMarks);
};
