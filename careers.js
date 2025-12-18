import { auth, db, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, onAuthStateChanged } from "./firebase-config.js";

// === CONFIGURATION ===
// CHANGE THIS TO YOUR EXACT LOGIN EMAIL
const ADMIN_EMAIL = "admin@snowdropunited.org"; 

const adminPanel = document.getElementById('admin-panel');
const jobList = document.getElementById('job-list');
const postJobForm = document.getElementById('post-job-form');
const modal = document.getElementById('application-modal');
const appForm = document.getElementById('application-form');
const closeModal = document.querySelector('.close-modal');

// 1. Check Authentication & Role
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        console.log("Logged in as:", user.email);
        
        // Show Admin Panel ONLY if email matches
        if(user.email === ADMIN_EMAIL) {
            adminPanel.style.display = "block";
        } else {
            adminPanel.style.display = "none";
        }
    } else {
        // User is not logged in
        // Ideally, we redirect to login if they try to apply, 
        // but for now we let them see the jobs.
        adminPanel.style.display = "none";
    }
});

// 2. Load Jobs from Database
const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
    jobList.innerHTML = ""; // Clear list
    
    if (snapshot.empty) {
        jobList.innerHTML = "<p>No open positions at the moment.</p>";
        return;
    }

    snapshot.forEach((doc) => {
        const job = doc.data();
        const div = document.createElement('div');
        div.className = "job-card";
        div.innerHTML = `
            <h3>${job.title}</h3>
            <div class="job-meta">📍 ${job.location} &nbsp;|&nbsp; 📅 Posted: ${new Date(job.createdAt.toDate()).toLocaleDateString()}</div>
            <p>${job.description}</p>
            <button class="btn-primary apply-btn" data-id="${doc.id}" data-title="${job.title}">Apply Now</button>
        `;
        jobList.appendChild(div);
    });

    // Add Click Listeners to new Apply Buttons
    document.querySelectorAll('.apply-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(!auth.currentUser) {
                alert("Please log in to apply for jobs.");
                window.location.href = "login.html";
                return;
            }
            openModal(e.target.dataset.id, e.target.dataset.title);
        });
    });
});

// 3. Post a Job (Admin Only)
if(postJobForm) {
    postJobForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('job-title').value;
        const location = document.getElementById('job-location').value;
        const desc = document.getElementById('job-desc').value;

        try {
            await addDoc(collection(db, "jobs"), {
                title: title,
                location: location,
                description: desc,
                createdAt: serverTimestamp(),
                postedBy: auth.currentUser.email
            });
            alert("Job posted successfully!");
            postJobForm.reset();
        } catch (error) {
            console.error("Error adding job: ", error);
            alert("Error posting job: " + error.message);
        }
    });
}

// 4. Submit Application
appForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const jobId = document.getElementById('app-job-id').value;
    const name = document.getElementById('app-name').value;
    const email = document.getElementById('app-email').value;
    const cover = document.getElementById('app-cover').value;
    const jobTitle = document.getElementById('modal-job-title').innerText.replace("Apply for: ", "");

    try {
        await addDoc(collection(db, "applications"), {
            jobId: jobId,
            jobTitle: jobTitle,
            applicantName: name,
            applicantEmail: email,
            coverLetter: cover,
            applicantUid: auth.currentUser.uid,
            appliedAt: serverTimestamp()
        });
        alert("Application sent! We will contact you soon.");
        modal.style.display = "none";
        appForm.reset();
    } catch (error) {
        alert("Error sending application: " + error.message);
    }
});

// Modal Logic
function openModal(id, title) {
    document.getElementById('app-job-id').value = id;
    document.getElementById('modal-job-title').innerText = "Apply for: " + title;
    
    // Auto-fill email if possible
    if(auth.currentUser) {
        document.getElementById('app-email').value = auth.currentUser.email;
    }
    
    modal.style.display = "flex";
}

closeModal.addEventListener('click', () => { modal.style.display = "none"; });
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };