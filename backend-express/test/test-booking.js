async function testBookingFlow() {
    const timestamp = Date.now();
    const proEmail = `pro_${timestamp}@test.com`;
    const clientEmail = `client_${timestamp}@test.com`;
  
    console.log("--- INITIALISATION ---");
    

    await fetch('http://127.0.0.1:3000/api/auth/register', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email: proEmail, password: "pass", role: "PRO" })
    });

    const loginPro = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email: proEmail, password: "pass" })
    });
    const tokenPro = (await loginPro.json()).token;
  

    const serviceRes = await fetch('http://127.0.0.1:3000/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenPro}` },
      body: JSON.stringify({ name: "Massage", duration: 60, price: 50 })
    });
    const serviceId = (await serviceRes.json()).service.id;
    console.log(`✅ Service créé (ID: ${serviceId})`);
  

    await fetch('http://127.0.0.1:3000/api/auth/register', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email: clientEmail, password: "pass", role: "CLIENT" })
    });

    const loginClient = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email: clientEmail, password: "pass" })
    });
    const tokenClient = (await loginClient.json()).token;
  

    const dateRdv = "2026-02-14T14:00:00.000Z"; 
    console.log("\n--- TENTATIVE 1 (Doit marcher) ---");
    const book1 = await fetch('http://127.0.0.1:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenClient}` },
      body: JSON.stringify({ serviceId, date: dateRdv })
    });
    console.log("Statut:", book1.status, await book1.json());
  

    console.log("\n--- TENTATIVE 2 (Doit échouer - Doublon) ---");
    const book2 = await fetch('http://127.0.0.1:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenClient}` },
      body: JSON.stringify({ serviceId, date: dateRdv })
    });
    console.log("Statut:", book2.status); 
  }
  
  testBookingFlow();