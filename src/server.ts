import express from 'express';
import type { Request, Response } from 'express';
import { categorize_response } from './categorizeResponse.js';
import cors from 'cors';
import { score_results } from './scoreResults.js';
import { addSurveyResults } from './database.js';

const app = express();
const port = 5000;

const isDevelopment: boolean = (process.env.NODE_ENV == 'development');

let response_ids: number[] = [];

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

	// No results will be shown if the response is creative, so feedback cannot be given
	if (json['categorization'] == 'creative') {
		res.send(json);
		return;
	}

	const send_survey: number = Math.floor((Math.random() * 2));
	let response_id: number = -1;
	if (send_survey == 1) {
		// Random 6 digit response id between 100000 and 999998
		response_id = Math.floor((Math.random() * 999999) + 100000);
		response_ids.push(response_id);
	}

	json['response_id'] = response_id;
	console.log(json)
	

	res.send(json);
});

app.post('/api/queries/rank', async (req: Request, res: Response) => {
	const input_string = JSON.stringify(req.body);

	const cleaned_input = truncateSearchResults(input_string);
	const response = await score_results(cleaned_input);

	const json = JSON.parse(response);

	// TODO: Check ai response before sending
	// await new Promise(f => setTimeout(f, 10000));
	res.send(json);
});

app.post('/api/metrics/', async (req: Request, res: Response) => {
	// const cleaned_input = truncateSearchResults(input);
	// const input_json = truncateSearchResults(req.body);
	const { helpful, response_id } = req.body;

	if (response_id == undefined || helpful == undefined) {
		return res.status(400).json({ error: "Invalid request" });
	}

	const found_key: number | undefined = response_ids.find(id => id == response_id);

	if (found_key == undefined) {
		return res.status(400).json({ error: "Invalid request" });
	}

	response_ids = response_ids.filter(id => id !== found_key);

	await addSurveyResults(helpful);

	res.sendStatus(200).end();
});

// Start the server
export default app;

if (isDevelopment) {
	app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
	});
}
