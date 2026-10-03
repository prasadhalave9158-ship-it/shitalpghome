// Shital PG Booking JavaScript

const rooms = [
 {share:2,no:"201",rent:2700,deposit:5400,beds:2},
 {share:2,no:"202",rent:2700,deposit:5400,beds:2},
 {share:5,no:"203",rent:2500,deposit:5000,beds:5},
 {share:4,no:"301",rent:2500,deposit:5000,beds:4}
];

let status = JSON.parse(localStorage.getItem("shitalPGStatus") || "{}");
const defaultStatus = "available";

function getBedStatus(roomNo, bedNo){
  if(!status[roomNo]) status[roomNo]={};
  return status[roomNo][bedNo] || defaultStatus;
}
function setBedStatus(roomNo, bedNo, value){
  if(!status[roomNo]) status[roomNo]={};
  status[roomNo][bedNo]=value;
  localStorage.setItem("shitalPGStatus",JSON.stringify(status));
}
function statusLabel(s){
  return s==="available" ? "Available" : s==="occupied" ? "Occupied" : "Not Available";
}
function statusClass(s){
  return s==="available" ? "status-available" : s==="occupied" ? "status-occupied" : "status-na";
}

function render(){
 const box=document.getElementById("rooms");
 box.innerHTML="";
 rooms.forEach(r=>{
   let availableCount=0;
   let bedHtml="";
   for(let i=1;i<=r.beds;i++){
     const s=getBedStatus(r.no,i);
     if(s==="available") availableCount++;
     bedHtml += `<span class="status-pill ${statusClass(s)}">Bed ${i}: ${statusLabel(s)}</span>`;
   }
   box.innerHTML += `
   <div class="card">
     <span class="badge">${r.share} Sharing</span>
     <div class="room">Room ${r.no}</div>
     <div class="row"><span>Rent / Bed</span><b>₹${r.rent}</b></div>
     <div class="row"><span>Security Deposit</span><b>₹${r.deposit}</b></div>
     <div class="row"><span>Available Beds</span><b class="${availableCount?'available':''}">${availableCount} / ${r.beds}</b></div>
     <div style="margin:10px 0">${bedHtml}</div>
     <div class="facilities">📶 Wi-Fi &nbsp; 🚗 Parking<br>📚 Study Table &nbsp; 🛏️ Single Bed<br>🛌 Gadda / Mattress<br>💧 RO Water &nbsp; 🔐 Personal Locker<br>🚰 24×7 Water Facility</div>
     <button onclick="openBooking('${r.no}')">${availableCount?'📲 Request to Book':'No Available Bed'}</button>
   </div>`;
 });
 renderAdmin();
}

function openBooking(no){
 const r=rooms.find(x=>x.no===no);
 const availableBeds=[...Array(r.beds)].map((_,i)=>i+1).filter(i=>getBedStatus(no,i)==="available");
 if(!availableBeds.length){alert("There are no available beds in this room.");return;}
 selectedRoom=r;
 selectedBed=null;
 document.getElementById("bookingName").value="";
 document.getElementById("bookingMobile").value="";
 document.getElementById("bookingSummary").innerHTML =
   `<b>Room ${r.no}</b><br>${r.share} Sharing &nbsp;•&nbsp; ₹${r.rent}/bed &nbsp;•&nbsp; Deposit ₹${r.deposit}`;
 const list=document.getElementById("bedList");
 list.innerHTML="";
 for(let i=1;i<=r.beds;i++){
   const s=getBedStatus(no,i);
   const b=document.createElement("button");
   b.type="button";
   b.className="bed-btn"+(s==="available"?"":" disabled");
   b.dataset.bed=i;
   b.textContent=`Bed ${i} • ${statusLabel(s)}`;
   if(s!=="available"){
     b.disabled=true;
     b.style.opacity=".45";
     b.style.cursor="not-allowed";
   }else{
     b.onclick=()=>selectBed(i);
   }
   list.appendChild(b);
 }
 document.getElementById("bookingOverlay").classList.add("show");
}

function selectBed(n){
 selectedBed=n;
 document.querySelectorAll(".bed-btn").forEach(b=>{
   b.classList.remove("selected");
   const bedNo=b.dataset.bed;
   if(bedNo) b.textContent=`Bed ${bedNo}`;
 });
 const selected=[...document.querySelectorAll(".bed-btn")].find(b=>b.dataset.bed===String(n));
 if(selected){
   selected.classList.add("selected");
   selected.textContent=`Bed ${n} ✓ Selected`;
 }
}

function closeBooking(){
 document.getElementById("bookingOverlay").classList.remove("show");
}

function sendBookingRequest(){
 if(!selectedRoom || !selectedBed){alert("Please select a bed number.");return;}
 const name=document.getElementById("bookingName").value.trim();
 const mobile=document.getElementById("bookingMobile").value.trim();
 if(!name){alert("Please enter your full name.");return;}
 if(!/^[0-9]{10}$/.test(mobile)){alert("Please enter a valid 10-digit mobile number.");return;}

 const msg=`Hello Shital PG, I want to book a bed.%0A%0ARoom No: ${selectedRoom.no}%0ABed No: ${selectedBed}%0ASharing: ${selectedRoom.share}%0AName: ${encodeURIComponent(name)}%0AMobile: ${mobile}%0ARent/Bed: ₹${selectedRoom.rent}%0ADeposit: ₹${selectedRoom.deposit}%0A%0APlease confirm availability.`;
 window.open("https://wa.me/919158588592?text="+msg,"_blank");
 setTimeout(()=>window.open("https://wa.me/919028083205?text="+msg,"_blank"),350);
 closeBooking();
}

function login(){
 if(document.getElementById("user").value==="admin" && document.getElementById("pass").value==="1234"){
   document.getElementById("adminPanel").classList.remove("hidden"); renderAdmin();
 }else alert("Invalid admin login.");
}
function logout(){document.getElementById("adminPanel").classList.add("hidden")}
function renderAdmin(){
 const p=document.getElementById("adminRooms"); if(!p)return;
 p.innerHTML=rooms.map(r=>`
 <div class="admin-card">
   <b>Room ${r.no}</b> — ${r.share} Sharing — ₹${r.rent}/bed
   <div class="bed-status-list">
   ${[...Array(r.beds)].map((_,idx)=>{
      const i=idx+1, s=getBedStatus(r.no,i);
      return `<div class="admin-bed">
        <div class="admin-bed-row">
          <span><b>Bed ${i}</b> <span class="status-pill ${statusClass(s)}">${statusLabel(s)}</span></span>
          <button onclick="cycleBedStatus('${r.no}',${i})">Change Status</button>
        </div>
      </div>`;
   }).join("")}
   </div>
 </div>`).join("");
}

function cycleBedStatus(no, bedNo){
 const current=getBedStatus(no,bedNo);
 const next=current==="available" ? "occupied" : current==="occupied" ? "na" : "available";
 setBedStatus(no,bedNo,next);
 render();
}

function setBooked(no,delta){ /* legacy compatibility */ }
render();
