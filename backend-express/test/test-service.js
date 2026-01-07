// test-service.js
async function testCreateService() {
    const email = `pro_${Date.now()}@test.com`;
    
    // 1. Inscription PRO
    console.log("1. Inscription...");
    await fetch('http://127.0.0.1:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: "pass", role: "PRO" })
    });
  
    // 2. Login pour avoir le token
    console.log("2. Login...");
    const loginRes = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: "pass" })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
  
    // 3. Création du service (AVEC LE TOKEN)
    console.log("3. Création Service (Coupe Homme)...");
    const serviceRes = await fetch('http://127.0.0.1:3000/api/services', {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <--- C'est ici que la magie opère
      },
      body: JSON.stringify({ name: "Coupe Homme", duration: 30, price: 25.0 })
    });
  
    const serviceData = await serviceRes.json();
    console.log("RÉSULTAT :", serviceData);
  }
  
  testCreateService();