import admin, { ServiceAccount } from "firebase-admin"
import { Reference } from "firebase-admin/database";

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
	throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY');
}

const serviceAccount: ServiceAccount = JSON.parse(serviceAccountKey) as ServiceAccount;

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://deepdive-a8c9d-default-rtdb.firebaseio.com"
});

const db = admin.database();

async function incrementValue(reference: Reference) {
	// TODO: Figure out potential concurrent modification issues
	const snapshot = await reference.get();
	const currentValue = snapshot.val();

	await reference.set(currentValue + 1);
}

export async function addSurveyResults(liked: boolean) {
	const reference = liked ? db.ref('liked_responses') : db.ref('disliked_responses');
	incrementValue(reference);
	
}

export async function countSurveySent() {
	const reference = db.ref('sent_surveys');
	incrementValue(reference);
	
}

export async function countSearchQuery() {
	const reference = db.ref('query_requests');
	incrementValue(reference);
}

export async function countSearchRankings() {
	const reference = db.ref('ranking_requests');
	incrementValue(reference);
}


