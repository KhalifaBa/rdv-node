// test-flow.js
async function testFullFlow() {
    // On génère un email unique basé sur l'heure actuelle pour éviter l'erreur "Déjà utilisé"
    const uniqueEmail = `user_${Date.now()}@test.com`;
    const password = "password123";
  
    console.log(`--- 1. TENTATIVE D'INSCRIPTION (${uniqueEmail}) ---`);
    
    const regResponse = await fetch('http://127.0.0.1:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: password, role: "PRO" })
    });
    
    const regData = await regResponse.json();
    console.log("Statut Inscription:", regResponse.status); // Doit être 201
  
    if (regResponse.status !== 201) {
      console.log("❌ Arrêt du test (Inscription échouée)", regData);
      return;
    }
  
    console.log("\n--- 2. TENTATIVE DE CONNEXION ---");
  
    const loginResponse = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: password })
    });
  
    const loginData = await loginResponse.json();
    
    if (loginResponse.status === 200) {
      console.log("✅ SUCCÈS TOTAL !");
      console.log("🔑 Token JWT reçu :", loginData.token.substring(0, 20) + "...");
      console.log("👤 User ID :", loginData.user.id);
    } else {
      console.log("❌ ÉCHEC Connexion :", loginData);
    }
  }
  
  testFullFlow();