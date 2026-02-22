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

	const json = JSON.parse(response);

	res.send(json);
});

app.post('/api/queries/rank', async (req: Request, res: Response) => {
	// const cleaned_input = truncateSearchResults(input);
	// const input_json = truncateSearchResults(req.body);
	const input_string = JSON.stringify(req.body);

	const cleaned_input = truncateSearchResults(input_string);
	const response = await score_results(cleaned_input);

	const json = JSON.parse(response);

	// TODO: Check ai response before sending
	// await new Promise(f => setTimeout(f, 10000));
	res.send(json);
});

// Start the server
export default app;