import admin, { ServiceAccount } from "firebase-admin"

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

export async function addSurveyResults(liked: boolean) {
	const reference = liked ? db.ref('liked_responses') : db.ref('disliked_responses');

	// TODO: Figure out potential concurrent modification issues
	const snapshot = await reference.get();
	const currentValue = snapshot.val();

	await reference.set(currentValue + 1);
}