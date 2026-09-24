const leads = [
  { homeowner: true, existingSystem: "None", billSize: 450, address: "14 Sunburst Crescent, Brabham WA 6055", name: "Daniel Miller", mobile: "0412884921", email: "miller.brabham@gmail.com" },
  { homeowner: true, existingSystem: "Small 3kW system", billSize: 600, address: "88 Grand Boulevard, Joondalup WA 6027", name: "Marcus Sterling", mobile: "0429119403", email: "m.sterling@westnet.com.au" },
  { homeowner: true, existingSystem: "None", billSize: 320, address: "27 Settlers Avenue, Baldivis WA 6171", name: "Chloe Nguyen", mobile: "0433902114", email: "nguyen.family.wa@outlook.com" },
  { homeowner: true, existingSystem: "None", billSize: 750, address: "52 Marine Terrace, Fremantle WA 6160", name: "Harrison Brooks", mobile: "0401773289", email: "h.brooks@freo.me" },
  { homeowner: true, existingSystem: "Old 1.5kW inverter broken", billSize: 900, address: "9 Ocean Drive, Cottesloe WA 6011", name: "Sarah Jenkins", mobile: "0499888777", email: "s.jenkins88@hotmail.com" }
];

async function submitLeads() {
  for (const lead of leads) {
    try {
      console.log(`Sending lead for ${lead.name}...`);
      const res = await fetch("http://localhost:3005/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      });
      const data = await res.json();
      console.log(`Result:`, data);
      await new Promise(r => setTimeout(r, 1000)); // wait 1s between submissions
    } catch (e) {
      console.error(e);
    }
  }
}
submitLeads();
