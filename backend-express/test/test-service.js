async function testCreateService() {
    const email = `pro_${Date.now()}@test.com`;
    
    console.log("1. Inscription...");
    await fetch('http://127.0.0.1:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: "pass", role: "PRO" })
    });
  
    console.log("2. Login...");
    const loginRes = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: "pass" })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
  
    console.log("3. Création Service (Coupe Homme)...");
    const serviceRes = await fetch('http://127.0.0.1:3000/api/services', {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: "Coupe Homme", duration: 30, price: 25.0 })
    });
  
    const serviceData = await serviceRes.json();
    console.log("RÉSULTAT :", serviceData);
  }
  
  testCreateService();