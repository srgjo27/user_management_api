import * as admin from 'firebase-admin';

import serviceAccount from '../../serviceAccountKey.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
});

const db = admin.firestore();
console.log('Firebase Connected!');

export { db };