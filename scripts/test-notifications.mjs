import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCx36ICQWoQhE2EdMUznnkOL0uJVFLRFLw",
  authDomain: "agendaparroquiasantodomingo.firebaseapp.com",
  projectId: "agendaparroquiasantodomingo",
  storageBucket: "agendaparroquiasantodomingo.firebasestorage.app",
  messagingSenderId: "946455167055",
  appId: "1:946455167055:web:c020634e0b52a2bbd42a3a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runTests() {
  console.log('\n PRUEBA DE NOTIFICACIONES');
  console.log('='.repeat(50));

  console.log('\nTEST 1: Leer notificaciones existentes...');
  try {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log('   VACIA: Coleccion notifications vacia o no existe.');
    } else {
      console.log('   OK: ' + snapshot.size + ' notificacion(es) encontradas:');
      snapshot.forEach(doc => {
        const d = doc.data();
        console.log('      - [' + doc.id + '] ' + d.title + ': ' + d.message);
      });
    }
  } catch (err) {
    console.log('   ERROR al leer: ' + err.message);
    console.log('   Causa probable: Reglas de Firestore bloquean lecturas sin autenticar.');
  }

  console.log('\nTEST 2: Escribir notificacion de prueba...');
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      title: 'Notificacion de prueba',
      message: 'Generada por script de test.',
      type: 'test',
      createdAt: serverTimestamp(),
      read: false,
    });
    console.log('   OK: Notificacion creada con ID: ' + docRef.id);
  } catch (err) {
    console.log('   ERROR al escribir: ' + err.message);
    if (err.code === 'permission-denied') {
      console.log('   DIAGNOSTICO: Reglas de Firestore no permiten escritura sin auth.');
    }
  }

  console.log('\nTEST 3: Verificar total en Firestore...');
  try {
    const snap = await getDocs(collection(db, 'notifications'));
    console.log('   Total en Firestore: ' + snap.size);
  } catch (err) {
    console.log('   ERROR: ' + err.message);
  }

  process.exit(0);
}

runTests().catch(e => { console.error(e); process.exit(1); });
