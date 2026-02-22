import express from 'express';
import type { Request, Response } from 'express';
import { categorize_response } from './categorizeResponse.js';
import cors from 'cors';
import { score_results } from './scoreResults.js';

const app = express();
const port = 5000;

export function truncateSearchQuery(input: string): string {
	if (input.length > 2048) {
		input = input.substring(0, 2048);
	}

	return input;
}

export function truncateSearchResults(input: string): string {
	if (input.length > 4096) {
		input = input.substring(0, 4096);
	}

	return input;
}


app.use(cors())

const corsOptions = {
	origin: '*',
	methods: ['POST'],
	allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));

app.use(express.json());


// POST endpoint
app.post('/api/queries/send', async (req: Request, res: Response) => {
	const { input } = req.body;
	const cleaned_input = truncateSearchQuery(input);
	const input_json = { "input": cleaned_input };
	// const { input } = JSON.parse(request);
	const response = await categorize_response(JSON.stringify(input_json));
	// const response = `{"categorization": "factual", "search_queries": ["This is a test. This is a long one just to test!", "Here\'s a shorter one"]}`
	const json = JSON.parse(response);

	res.send(json);
});

app.post('/api/queries/rank', async (req: Request, res: Response) => {
	// const cleaned_input = truncateSearchResults(input);
	// const input_json = truncateSearchResults(req.body);
	const input_string = JSON.stringify(req.body);

	const cleaned_input = truncateSearchResults(input_string);
	const response = await score_results(cleaned_input);
	//     const response = `{
	//   "rankings": [
	//     {
	//       "url": "https://www.mathway.com/popular-problems/Calculus/501047",
	//       "title": "Calculus Examples - d/dx y=3x^2",
	//       "reason": "Highly relevant, directly addresses the problem $d/dx(3x^2)$, and Mathway is a well-known, authoritative source for mathematical computation and steps.",
	//       "score": 10,
	//       "index": 0
	//     },
	//     {
	//       "url": ",",
	//       "title": "What is the Derivative of 3x^2?",
	//       "reason": "The title and description perfectly match the query intent. However, the URL is missing, preventing verification of site authority and accuracy beyond the description snippet.",
	//       "score": 8,
	//       "index": 1
	//     },
	//     {
	//       "url": "https://www.derivative-calculator.net/",
	//       "title": "Derivative Calculator • With Steps!",
	//       "reason": "Extremely relevant as it provides the exact tool needed to solve the query, including steps. Good utility and purpose.",
	//       "score": 9,
	//       "index": 2
	//     },
	//     {
	//       "url": "https://homework.study.com/explanation/what-is-the-derivative-of-3x-2.html",
	//       "title": "What is the derivative of 3x^2?",
	//       "reason": "Highly relevant, directly addresses the question, and Study.com is an established educational site providing solution steps.",
	//       "score": 10,
	//       "index": 3
	//     },
	//     {
	//       "url": ",",
	//       "title": "3x^2+4 with respect to x.",
	//       "reason": "Partially relevant, as it deals with $3x^2$, but the inclusion of '+4' deviates from the specific query. The missing URL reduces confidence in authority/accuracy.",
	//       "score": 6,
	//       "index": 4
	//     },
	//     {
	//       "url": "https://www.reddit.com/r/askmath/comments/okpey8/how_to_find_derivatives_does_anyone_know_how_did/",
	//       "title": "How To Find Derivatives: Does anyone know how did they ...",
	//       "reason": "Low relevance. It is about derivatives in general, but specifically discusses how $3x^2$ is derived from $x^3$, not how to take the derivative of $3x^2$. It is user-curated content.",
	//       "score": 4,
	//       "index": 5
	//     },
	//     {
	//       "url": "https://math.stackexchange.com/questions/18059/derivative-of-3x-2",
	//       "title": "calculus - Derivative of 3^(x/2)",
	//       "reason": "Low relevance. The result appears to misunderstand the query, calculating the derivative of $3^{(x/2)}$ instead of $3x^2$. While Stack Exchange is authoritative, it solves the wrong problem.",
	//       "score": 2,
	//       "index": 6
	//     },
	//     {
	//       "url": ",",
	//       "title": "What is the derivative of 3x^2?",
	//       "reason": "The title is relevant, but the description suggests the answer provided (18) is context-dependent or likely incorrect if seeking the general derivative function, leading to low accuracy trust. URL is missing.",
	//       "score": 1,
	//       "index": 7
	//     },
	//     {
	//       "url": "https://www.symbolab.com/solver/derivative-calculator",
	//       "title": "Derivative Calculator",
	//       "reason": "Highly relevant tool designed for this exact purpose. Symbolab is a trusted mathematical solver.",
	//       "score": 10,
	//       "index": 8
	//     },
	//     {
	//       "url": "https://www.studocu.com/en-us/messages/question/2770452/what-is-the-derivative-of-3x2",
	//       "title": "What is the derivative of 3x^2 - machine design and cad",
	//       "reason": "Highly relevant, provides the correct answer (6x) and comes from an educational resource. Strong authority and accuracy based on the snippet.",
	//       "score": 10,
	//       "index": 9
	//     }
	//   ]
	// }`
	const json = JSON.parse(response);

	// TODO: Check ai response before sending
	// await new Promise(f => setTimeout(f, 10000));
	res.send(json);
});

// Start the server
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});