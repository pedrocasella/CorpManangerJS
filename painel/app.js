import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { get, getDatabase, ref, push, set, remove, update, child } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { getFirestore, collection, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

import { firebaseConfig } from './../firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);